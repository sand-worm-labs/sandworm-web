import { In } from 'typeorm';
import { EnvironmentStatus } from '@sandworm/postgresql-typeorm';
import { EnvironmentService } from '../environment.service';

function makeService() {
  const environmentRepository = {
    findOne: jest.fn(),
    create: jest.fn((v) => v),
    save: jest.fn((v) => Promise.resolve(v)),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
  } as any;
  const envVarRepository = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn(),
    delete: jest.fn(),
    create: jest.fn((v) => v),
    save: jest.fn(),
  } as any;
  const jupyterService = {
    restart: jest.fn(),
    setEnvironmentVariables: jest.fn(),
  } as any;
  const eventEmitter = { emit: jest.fn() } as any;
  const eventEmitterReadinessWatcher = { waitUntilReady: jest.fn().mockResolvedValue(undefined) } as any;

  const service = new EnvironmentService(
    environmentRepository,
    envVarRepository,
    jupyterService,
    eventEmitter,
    eventEmitterReadinessWatcher,
  );

  return { service, environmentRepository, envVarRepository, jupyterService, eventEmitter, eventEmitterReadinessWatcher };
}

const WORKSPACE_ID = 'ws-1';

function makeEnvironmentEntity(overrides: Record<string, unknown> = {}) {
  return {
    id: 'env-1',
    workspaceId: WORKSPACE_ID,
    status: EnvironmentStatus.STOPPED,
    resourceVersion: 0,
    lastActivityAt: new Date(),
    startedAt: null,
    ...overrides,
  };
}

describe('EnvironmentService', () => {
  describe('getEnvironment', () => {
    it('creates and persists a stopped environment when none exists', async () => {
      const { service, environmentRepository, eventEmitter } = makeService();
      environmentRepository.findOne.mockResolvedValue(null);

      const result = await service.getEnvironment(WORKSPACE_ID);

      expect(environmentRepository.create).toHaveBeenCalledWith({
        workspaceId: WORKSPACE_ID,
        status: EnvironmentStatus.STOPPED,
        resourceVersion: 0,
      });
      expect(environmentRepository.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalled();
      expect(result.status).toBe(EnvironmentStatus.STOPPED);
    });

    it('returns the existing environment without creating one', async () => {
      const { service, environmentRepository, eventEmitter } = makeService();
      environmentRepository.findOne.mockResolvedValue(makeEnvironmentEntity());

      const result = await service.getEnvironment(WORKSPACE_ID);

      expect(environmentRepository.create).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
      expect(result.workspaceId).toBe(WORKSPACE_ID);
    });
  });

  describe('getEnvironmentStatus', () => {
    it('returns the status of the environment', async () => {
      const { service, environmentRepository } = makeService();
      environmentRepository.findOne.mockResolvedValue(makeEnvironmentEntity({ status: EnvironmentStatus.RUNNING }));

      const result = await service.getEnvironmentStatus(WORKSPACE_ID);

      expect(result).toBe(EnvironmentStatus.RUNNING);
    });
  });

  describe('restartEnvironment', () => {
    it('restarts jupyter and marks the environment RUNNING', async () => {
      const { service, environmentRepository, jupyterService, eventEmitter } = makeService();
      environmentRepository.findOne.mockResolvedValue(makeEnvironmentEntity());

      const result = await service.restartEnvironment(WORKSPACE_ID);

      expect(environmentRepository.update).toHaveBeenCalledWith(
        { workspaceId: WORKSPACE_ID },
        { status: EnvironmentStatus.STOPPING },
      );
      expect(jupyterService.restart).toHaveBeenCalledWith(WORKSPACE_ID);
      expect(environmentRepository.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalled();
      expect(result.status).toBe(EnvironmentStatus.RUNNING);
    });

    it('throws when the environment disappears after restart', async () => {
      const { service, environmentRepository, jupyterService } = makeService();
      environmentRepository.findOne.mockResolvedValue(null);

      await expect(service.restartEnvironment(WORKSPACE_ID)).rejects.toThrow();
      expect(jupyterService.restart).toHaveBeenCalled();
      // stopped-status recovery update still runs in the catch block
      expect(environmentRepository.update).toHaveBeenCalledWith(
        { workspaceId: WORKSPACE_ID },
        { status: EnvironmentStatus.STOPPED },
      );
    });

    it('marks the environment STOPPED and re-throws when jupyter restart fails', async () => {
      const { service, environmentRepository, jupyterService, eventEmitter } = makeService();
      const error = new Error('jupyter unreachable');
      jupyterService.restart.mockRejectedValue(error);

      await expect(service.restartEnvironment(WORKSPACE_ID)).rejects.toThrow('jupyter unreachable');

      expect(environmentRepository.update).toHaveBeenLastCalledWith(
        { workspaceId: WORKSPACE_ID },
        { status: EnvironmentStatus.STOPPED },
      );
      expect(eventEmitter.emit).toHaveBeenCalled();
      expect(environmentRepository.findOne).not.toHaveBeenCalled();
    });
  });

  describe('getEnvironmentVariables', () => {
    it('returns variables ordered by name', async () => {
      const { service, envVarRepository } = makeService();
      envVarRepository.find.mockResolvedValue([{ id: 'v1', name: 'A', value: 'x', workspaceId: WORKSPACE_ID, updatedAt: new Date() }]);

      const result = await service.getEnvironmentVariables(WORKSPACE_ID);

      expect(envVarRepository.find).toHaveBeenCalledWith({
        where: { workspaceId: WORKSPACE_ID },
        order: { name: 'ASC' },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('getEnvironmentVariable', () => {
    it('returns null when the variable does not exist', async () => {
      const { service, envVarRepository } = makeService();
      envVarRepository.findOne.mockResolvedValue(null);

      const result = await service.getEnvironmentVariable(WORKSPACE_ID, 'MY_VAR');

      expect(result).toBeNull();
    });

    it('returns the mapped variable when found', async () => {
      const { service, envVarRepository } = makeService();
      envVarRepository.findOne.mockResolvedValue({
        id: 'v1',
        name: 'MY_VAR',
        value: 'x',
        workspaceId: WORKSPACE_ID,
        updatedAt: new Date(),
      });

      const result = await service.getEnvironmentVariable(WORKSPACE_ID, 'MY_VAR');

      expect(result?.name).toBe('MY_VAR');
    });
  });

  describe('setEnvironmentVariables', () => {
    it('adds and removes variables and syncs with jupyter', async () => {
      const { service, envVarRepository, jupyterService } = makeService();
      envVarRepository.find
        .mockResolvedValueOnce([{ name: 'OLD_VAR' }]) // removeNames lookup
        .mockResolvedValueOnce([]); // getEnvironmentVariables at the end

      const result = await service.setEnvironmentVariables(WORKSPACE_ID, {
        add: [{ name: 'NEW_VAR', value: 'v' }],
        remove: ['id-1'],
      } as any);

      expect(envVarRepository.delete).toHaveBeenCalledWith({ id: In(['id-1']), workspaceId: WORKSPACE_ID });
      expect(envVarRepository.save).toHaveBeenCalled();
      expect(jupyterService.setEnvironmentVariables).toHaveBeenCalledWith(WORKSPACE_ID, {
        add: [{ name: 'NEW_VAR', value: 'v' }],
        remove: ['OLD_VAR'],
      });
      expect(result).toEqual([]);
    });

    it('skips remove lookup/delete when remove list is empty', async () => {
      const { service, envVarRepository, jupyterService } = makeService();
      envVarRepository.find.mockResolvedValueOnce([]); // getEnvironmentVariables at the end

      await service.setEnvironmentVariables(WORKSPACE_ID, {
        add: [{ name: 'NEW_VAR', value: 'v' }],
        remove: [],
      } as any);

      expect(envVarRepository.delete).not.toHaveBeenCalled();
      expect(envVarRepository.save).toHaveBeenCalled();
      expect(jupyterService.setEnvironmentVariables).toHaveBeenCalledWith(WORKSPACE_ID, {
        add: [{ name: 'NEW_VAR', value: 'v' }],
        remove: [],
      });
    });

    it('skips save when add list is empty', async () => {
      const { service, envVarRepository } = makeService();
      envVarRepository.find.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

      await service.setEnvironmentVariables(WORKSPACE_ID, { add: [], remove: ['id-1'] } as any);

      expect(envVarRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('deleteEnvironmentVariable', () => {
    it('returns true when a row was deleted', async () => {
      const { service, envVarRepository } = makeService();
      envVarRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.deleteEnvironmentVariable(WORKSPACE_ID, 'var-1');

      expect(result).toBe(true);
    });

    it('returns false when no row was deleted', async () => {
      const { service, envVarRepository } = makeService();
      envVarRepository.delete.mockResolvedValue({ affected: 0 });

      const result = await service.deleteEnvironmentVariable(WORKSPACE_ID, 'var-1');

      expect(result).toBe(false);
    });

    it('returns false when affected is undefined', async () => {
      const { service, envVarRepository } = makeService();
      envVarRepository.delete.mockResolvedValue({ affected: undefined });

      const result = await service.deleteEnvironmentVariable(WORKSPACE_ID, 'var-1');

      expect(result).toBe(false);
    });
  });

  describe('registerLastActivity', () => {
    it('throws NotFoundException when no row was updated', async () => {
      const { service, environmentRepository } = makeService();
      environmentRepository.update.mockResolvedValue({ affected: 0 });

      await expect(service.registerLastActivity(WORKSPACE_ID, new Date())).rejects.toThrow(
        `Environment not found for workspace ${WORKSPACE_ID}`,
      );
    });

    it('throws NotFoundException when the environment cannot be reloaded', async () => {
      const { service, environmentRepository } = makeService();
      environmentRepository.update.mockResolvedValue({ affected: 1 });
      environmentRepository.findOne.mockResolvedValue(null);

      await expect(service.registerLastActivity(WORKSPACE_ID, new Date())).rejects.toThrow();
    });

    it('returns the updated environment on success', async () => {
      const { service, environmentRepository } = makeService();
      environmentRepository.update.mockResolvedValue({ affected: 1 });
      environmentRepository.findOne.mockResolvedValue(makeEnvironmentEntity());

      const result = await service.registerLastActivity(WORKSPACE_ID, new Date());

      expect(result.workspaceId).toBe(WORKSPACE_ID);
    });
  });
});
