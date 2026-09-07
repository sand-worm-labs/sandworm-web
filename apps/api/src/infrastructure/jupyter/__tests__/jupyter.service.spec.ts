// @jupyterlab/services is a heavy ESM-only SDK that talks to a real Jupyter
// kernel server over HTTP/WebSocket — mock it entirely so jest never loads
// the real module chain or attempts any real kernel connection.
jest.mock('@jupyterlab/services', () => ({
  KernelManager: jest.fn().mockImplementation(() => ({ dispose: jest.fn(), isDisposed: false })),
  SessionManager: jest.fn().mockImplementation(() => ({ dispose: jest.fn(), isDisposed: false })),
  ServerConnection: { makeSettings: jest.fn((opts: unknown) => opts) },
}));

// SandwormJupyterExtension performs real axios HTTP calls against the
// Jupyter file API — mock it so JupyterService's file methods can be tested
// in isolation via a controllable fake instance.
jest.mock('../Jupyter.extension.js', () => ({
  SandwormJupyterExtension: jest.fn(),
}));

import { EventEmitter } from 'events';
import { Readable } from 'stream';
import { KernelManager, SessionManager } from '@jupyterlab/services';
import { EnvironmentStatus } from '@sandworm/postgresql-typeorm';
import { JupyterService } from '../jupyter.service';
import { SandwormJupyterExtension } from '../Jupyter.extension.js';
import { EventNames } from '@/events/environment.events';

function makeExtension() {
  return {
    statFile: jest.fn(),
    readFile: jest.fn(),
    writeFile: jest.fn(),
    deleteFile: jest.fn(),
    listFiles: jest.fn(),
    getCWD: jest.fn().mockResolvedValue('/cwd'),
  };
}

function makeService(configValues: Record<string, unknown> = {}) {
  const environmentRepository = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn(),
    save: jest.fn(),
  } as any;
  const configService = { get: jest.fn((key: string) => configValues[key]) } as any;
  const lockService = { acquireLock: jest.fn((_name: string, cb: () => Promise<unknown>) => cb()) } as any;
  const eventEmitter = { emit: jest.fn() } as any;

  const extension = makeExtension();
  (SandwormJupyterExtension as jest.Mock).mockImplementation(() => extension);

  const service = new JupyterService(environmentRepository, configService, lockService, eventEmitter);
  return { service, environmentRepository, configService, lockService, eventEmitter, extension };
}

const WORKSPACE_ID = 'w1';

afterEach(() => {
  jest.clearAllMocks();
  (global as any).fetch = undefined;
});

describe('JupyterService', () => {
  describe('poll (via start)', () => {
    it('marks an environment RUNNING and emits status update when the server responds ok', async () => {
      const { service, environmentRepository, eventEmitter } = makeService();
      const env = { id: 'e1', workspaceId: WORKSPACE_ID, status: EnvironmentStatus.STOPPED, startedAt: null };
      environmentRepository.find.mockResolvedValue([env]);
      global.fetch = jest.fn().mockResolvedValue({ ok: true }) as any;

      await service.start();
      await service.onModuleDestroy();

      expect(environmentRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: EnvironmentStatus.RUNNING }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        EventNames.ENVIRONMENT_STATUS_UPDATE,
        expect.objectContaining({ workspaceId: WORKSPACE_ID, status: EnvironmentStatus.RUNNING }),
      );
    });

    it('marks an environment STOPPED and emits status update when the server responds not ok', async () => {
      const { service, environmentRepository, eventEmitter } = makeService();
      const env = { id: 'e1', workspaceId: WORKSPACE_ID, status: EnvironmentStatus.RUNNING, startedAt: new Date() };
      environmentRepository.find.mockResolvedValue([env]);
      global.fetch = jest.fn().mockResolvedValue({ ok: false }) as any;

      await service.start();
      await service.onModuleDestroy();

      expect(environmentRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: EnvironmentStatus.STOPPED, startedAt: null }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        EventNames.ENVIRONMENT_STATUS_UPDATE,
        expect.objectContaining({ workspaceId: WORKSPACE_ID, status: EnvironmentStatus.STOPPED }),
      );
    });

    it('does not re-save the environment when its status has not changed', async () => {
      const { service, environmentRepository, eventEmitter } = makeService();
      const env = { id: 'e1', workspaceId: WORKSPACE_ID, status: EnvironmentStatus.RUNNING, startedAt: new Date() };
      environmentRepository.find.mockResolvedValue([env]);
      global.fetch = jest.fn().mockResolvedValue({ ok: true }) as any;

      await service.start();
      await service.onModuleDestroy();

      expect(environmentRepository.save).not.toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalled();
    });

    it('does not throw when the status check fetch rejects, and continues past it', async () => {
      const { service, environmentRepository } = makeService();
      const env = { id: 'e1', workspaceId: WORKSPACE_ID, status: EnvironmentStatus.STOPPED, startedAt: null };
      environmentRepository.find.mockResolvedValue([env]);
      global.fetch = jest.fn().mockRejectedValue(new Error('ECONNREFUSED')) as any;

      await expect(service.start()).resolves.toBeUndefined();
      await service.onModuleDestroy();

      expect(environmentRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('bindWorkspace', () => {
    it('creates kernel/session managers on first call and reuses them on subsequent calls', async () => {
      const { service } = makeService();

      await service.bindWorkspace(WORKSPACE_ID);
      await service.bindWorkspace(WORKSPACE_ID);

      expect(KernelManager).toHaveBeenCalledTimes(1);
      expect(SessionManager).toHaveBeenCalledTimes(1);
    });
  });

  describe('stop', () => {
    it('disposes and removes the kernel/session managers for a bound workspace', async () => {
      const { service } = makeService();
      await service.bindWorkspace(WORKSPACE_ID);
      const km = (KernelManager as jest.Mock).mock.results[0].value;
      const sm = (SessionManager as jest.Mock).mock.results[0].value;

      await service.stop(WORKSPACE_ID);

      expect(km.dispose).toHaveBeenCalled();
      expect(sm.dispose).toHaveBeenCalled();
      // stopping again should be a no-op, not throw
      await expect(service.stop(WORKSPACE_ID)).resolves.toBeUndefined();
    });

    it('does nothing when the workspace was never bound', async () => {
      const { service } = makeService();

      await expect(service.stop('never-bound')).resolves.toBeUndefined();
    });
  });

  describe('restart', () => {
    it('acquires the restart lock, stops, restarts the active kernel, and rebinds', async () => {
      const { service, lockService, eventEmitter } = makeService();
      await service.bindWorkspace(WORKSPACE_ID);
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 'kernel-1' }] } as any) // getActiveKernelId
        .mockResolvedValueOnce({ ok: true } as any); // restart POST

      await service.restart(WORKSPACE_ID);

      expect(lockService.acquireLock).toHaveBeenCalledWith(`jupyter:restart:${WORKSPACE_ID}`, expect.any(Function));
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/kernels/kernel-1/restart'),
        expect.objectContaining({ method: 'POST' }),
      );
      const statuses = eventEmitter.emit.mock.calls.map((c: any[]) => c[1].status);
      expect(statuses).toEqual([EnvironmentStatus.STOPPING, EnvironmentStatus.STOPPED, EnvironmentStatus.RUNNING]);
    });

    it('skips the kernel restart HTTP call when there is no active kernel', async () => {
      const { service } = makeService();
      global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => [] } as any);

      await service.restart(WORKSPACE_ID);

      const restartCalls = (global.fetch as jest.Mock).mock.calls.filter((c) => String(c[0]).includes('/restart'));
      expect(restartCalls).toHaveLength(0);
    });
  });

  describe('ensureRunning', () => {
    it('binds the workspace when not already bound', async () => {
      const { service } = makeService();

      await service.ensureRunning(WORKSPACE_ID);

      expect(KernelManager).toHaveBeenCalledTimes(1);
    });

    it('does not rebind an already-bound workspace', async () => {
      const { service } = makeService();
      await service.bindWorkspace(WORKSPACE_ID);

      await service.ensureRunning(WORKSPACE_ID);

      expect(KernelManager).toHaveBeenCalledTimes(1);
    });
  });

  describe('isRunning', () => {
    it('returns true when the status endpoint responds ok', async () => {
      const { service } = makeService();
      global.fetch = jest.fn().mockResolvedValue({ ok: true }) as any;

      await expect(service.isRunning(WORKSPACE_ID)).resolves.toBe(true);
    });

    it('returns false when the status endpoint responds not ok', async () => {
      const { service } = makeService();
      global.fetch = jest.fn().mockResolvedValue({ ok: false }) as any;

      await expect(service.isRunning(WORKSPACE_ID)).resolves.toBe(false);
    });

    it('returns false when the fetch call throws', async () => {
      const { service } = makeService();
      global.fetch = jest.fn().mockRejectedValue(new Error('down')) as any;

      await expect(service.isRunning(WORKSPACE_ID)).resolves.toBe(false);
    });
  });

  describe('getEnvironmentStatus', () => {
    it('returns the stored status and startedAt when the environment exists', async () => {
      const { service, environmentRepository } = makeService();
      const startedAt = new Date();
      environmentRepository.findOne.mockResolvedValue({ status: EnvironmentStatus.RUNNING, startedAt });

      await expect(service.getEnvironmentStatus(WORKSPACE_ID)).resolves.toEqual({
        status: EnvironmentStatus.RUNNING,
        startedAt,
      });
    });

    it('defaults to STOPPED/null when the environment does not exist', async () => {
      const { service, environmentRepository } = makeService();
      environmentRepository.findOne.mockResolvedValue(null);

      await expect(service.getEnvironmentStatus(WORKSPACE_ID)).resolves.toEqual({
        status: EnvironmentStatus.STOPPED,
        startedAt: null,
      });
    });
  });

  describe('fileExists', () => {
    it('returns true when statFile succeeds', async () => {
      const { service, extension } = makeService();
      extension.statFile.mockResolvedValue({ _tag: 'success', file: {} });

      await expect(service.fileExists(WORKSPACE_ID, 'a.txt')).resolves.toBe(true);
    });

    it('returns false when statFile reports not-found', async () => {
      const { service, extension } = makeService();
      extension.statFile.mockResolvedValue({ _tag: 'error', reason: 'not-found' });

      await expect(service.fileExists(WORKSPACE_ID, 'a.txt')).resolves.toBe(false);
    });

    it('throws for any other statFile error', async () => {
      const { service, extension } = makeService();
      extension.statFile.mockResolvedValue({ _tag: 'error', reason: 'is-directory' });

      await expect(service.fileExists(WORKSPACE_ID, 'a.txt')).rejects.toThrow('Failed to stat file: is-directory');
    });
  });

  describe('getFile', () => {
    it('returns the size/stream and resolves exitCode 0 when the stream finishes', async () => {
      const { service, extension } = makeService();
      const stream = new EventEmitter() as unknown as Readable;
      extension.readFile.mockResolvedValue({ _tag: 'success', size: 42, stream });

      const result = await service.getFile(WORKSPACE_ID, 'a.txt');

      expect(result?.size).toBe(42);
      (stream as unknown as EventEmitter).emit('finish');
      await expect(result?.exitCode).resolves.toBe(0);
    });

    it('rejects exitCode when the stream errors', async () => {
      const { service, extension } = makeService();
      const stream = new EventEmitter() as unknown as Readable;
      extension.readFile.mockResolvedValue({ _tag: 'success', size: 1, stream });

      const result = await service.getFile(WORKSPACE_ID, 'a.txt');
      const err = new Error('read failed');
      (stream as unknown as EventEmitter).emit('error', err);

      await expect(result?.exitCode).rejects.toBe(err);
    });

    it('returns null when readFile reports not-found', async () => {
      const { service, extension } = makeService();
      extension.readFile.mockResolvedValue({ _tag: 'error', reason: 'not-found' });

      await expect(service.getFile(WORKSPACE_ID, 'a.txt')).resolves.toBeNull();
    });

    it('throws for any other readFile error', async () => {
      const { service, extension } = makeService();
      extension.readFile.mockResolvedValue({ _tag: 'error', reason: 'is-directory' });

      await expect(service.getFile(WORKSPACE_ID, 'a.txt')).rejects.toThrow('Failed to read file: is-directory');
    });
  });

  describe('putFile', () => {
    const FILE = new Readable();

    it('returns already-exists when the file exists and replace is false', async () => {
      const { service, extension } = makeService();
      extension.statFile.mockResolvedValue({ _tag: 'success', file: {} });

      await expect(service.putFile(WORKSPACE_ID, 'a.txt', false, FILE)).resolves.toBe('already-exists');
      expect(extension.writeFile).not.toHaveBeenCalled();
    });

    it('writes and returns success when replace is true', async () => {
      const { service, extension } = makeService();
      extension.statFile.mockResolvedValue({ _tag: 'success', file: {} });
      extension.writeFile.mockResolvedValue({ _tag: 'success' });

      await expect(service.putFile(WORKSPACE_ID, 'a.txt', true, FILE)).resolves.toBe('success');
      expect(extension.writeFile).toHaveBeenCalled();
    });

    it('writes and returns success when the file does not already exist', async () => {
      const { service, extension } = makeService();
      extension.statFile.mockResolvedValue({ _tag: 'error', reason: 'not-found' });
      extension.writeFile.mockResolvedValue({ _tag: 'success' });

      await expect(service.putFile(WORKSPACE_ID, 'a.txt', false, FILE)).resolves.toBe('success');
    });

    it('throws when statFile fails with a non-not-found error', async () => {
      const { service, extension } = makeService();
      extension.statFile.mockResolvedValue({ _tag: 'error', reason: 'is-directory' });

      await expect(service.putFile(WORKSPACE_ID, 'a.txt', true, FILE)).rejects.toThrow(
        'Failed to stat file: is-directory',
      );
    });

    it('throws when writeFile fails', async () => {
      const { service, extension } = makeService();
      extension.statFile.mockResolvedValue({ _tag: 'error', reason: 'not-found' });
      extension.writeFile.mockResolvedValue({ _tag: 'error', reason: 'is-directory' });

      await expect(service.putFile(WORKSPACE_ID, 'a.txt', true, FILE)).rejects.toThrow(
        'Failed to write file: is-directory',
      );
    });
  });

  describe('deleteFile', () => {
    it('resolves without throwing on success', async () => {
      const { service, extension } = makeService();
      extension.deleteFile.mockResolvedValue({ _tag: 'success' });

      await expect(service.deleteFile(WORKSPACE_ID, 'a.txt')).resolves.toBeUndefined();
    });

    it('resolves without throwing when the file is already gone', async () => {
      const { service, extension } = makeService();
      extension.deleteFile.mockResolvedValue({ _tag: 'error', reason: 'not-found' });

      await expect(service.deleteFile(WORKSPACE_ID, 'a.txt')).resolves.toBeUndefined();
    });

    it('throws for any other delete error', async () => {
      const { service, extension } = makeService();
      extension.deleteFile.mockResolvedValue({ _tag: 'error', reason: 'is-directory' });

      await expect(service.deleteFile(WORKSPACE_ID, 'a.txt')).rejects.toThrow('Failed to delete file: is-directory');
    });
  });

  describe('listFiles', () => {
    it('maps extension files into SandwormFile shape with a cwd-relative path', async () => {
      const { service, extension } = makeService();
      extension.listFiles.mockResolvedValue({
        _tag: 'success',
        files: [
          {
            name: 'a.txt',
            path: '/cwd/sub/a.txt',
            size: 10,
            mimeType: 'text/plain',
            created: 12345,
            isDirectory: false,
          },
        ],
      });

      const result = await service.listFiles(WORKSPACE_ID);

      expect(result).toEqual([
        {
          name: 'a.txt',
          path: '/cwd/sub/a.txt',
          relCwdPath: 'sub/a.txt',
          size: 10,
          mimeType: 'text/plain',
          createdAt: 12345,
          isDirectory: false,
        },
      ]);
    });

    it('throws when listFiles fails', async () => {
      const { service, extension } = makeService();
      extension.listFiles.mockResolvedValue({ _tag: 'error', reason: 'not-found' });

      await expect(service.listFiles(WORKSPACE_ID)).rejects.toThrow('Failed to list files: not-found');
    });
  });

  describe('deploy', () => {
    it('throws Method not implemented', () => {
      const { service } = makeService();

      expect(() => service.deploy()).toThrow('Method not implemented.');
    });
  });

  describe('onModuleDestroy', () => {
    it('disposes all bound kernel/session managers and clears internal maps', async () => {
      const { service } = makeService();
      await service.bindWorkspace(WORKSPACE_ID);
      const km = (KernelManager as jest.Mock).mock.results[0].value;
      const sm = (SessionManager as jest.Mock).mock.results[0].value;

      await service.onModuleDestroy();

      expect(km.dispose).toHaveBeenCalled();
      expect(sm.dispose).toHaveBeenCalled();
    });
  });
});
