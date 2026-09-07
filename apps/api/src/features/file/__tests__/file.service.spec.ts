import { Readable } from 'stream';
import { FileService } from '../file.service';

function makeService() {
  const jupyterService = {
    listFiles: jest.fn(),
    ensureRunning: jest.fn().mockResolvedValue(undefined),
    getFile: jest.fn(),
    fileExists: jest.fn(),
    putFile: jest.fn(),
    deleteFile: jest.fn(),
  } as any;

  const service = new FileService(jupyterService);
  return { service, jupyterService };
}

const WORKSPACE_ID = 'ws-1';

describe('FileService', () => {
  describe('listFiles', () => {
    it('delegates to jupyterService.listFiles', async () => {
      const { service, jupyterService } = makeService();
      const files = [{ name: 'a.csv' }];
      jupyterService.listFiles.mockResolvedValue(files);

      const result = await service.listFiles({ workspaceId: WORKSPACE_ID } as any);

      expect(jupyterService.listFiles).toHaveBeenCalledWith(WORKSPACE_ID);
      expect(result).toBe(files);
    });
  });

  describe('getFile', () => {
    it('returns null when jupyter has no file', async () => {
      const { service, jupyterService } = makeService();
      jupyterService.getFile.mockResolvedValue(null);

      const result = await service.getFile(WORKSPACE_ID, 'a.csv');

      expect(jupyterService.ensureRunning).toHaveBeenCalledWith(WORKSPACE_ID);
      expect(result).toBeNull();
    });

    it('returns the stream/size/exitCode when found', async () => {
      const { service, jupyterService } = makeService();
      const stream = new Readable();
      const exitCode = Promise.resolve(0);
      jupyterService.getFile.mockResolvedValue({ stream, size: 42, exitCode });

      const result = await service.getFile(WORKSPACE_ID, 'a.csv');

      expect(result).toEqual({ stream, size: 42, exitCode });
    });
  });

  describe('uploadFile', () => {
    const fileStream = Readable.from(Buffer.from('data'));

    it('throws when file exists and replace is false', async () => {
      const { service, jupyterService } = makeService();
      jupyterService.fileExists.mockResolvedValue(true);

      await expect(service.uploadFile(WORKSPACE_ID, 'a.csv', false, fileStream)).rejects.toThrow(
        'File already exists',
      );
      expect(jupyterService.putFile).not.toHaveBeenCalled();
    });

    it('skips existence check when replace is true', async () => {
      const { service, jupyterService } = makeService();
      jupyterService.putFile.mockResolvedValue('ok');

      const result = await service.uploadFile(WORKSPACE_ID, 'a.csv', true, fileStream);

      expect(jupyterService.fileExists).not.toHaveBeenCalled();
      expect(jupyterService.putFile).toHaveBeenCalledWith(WORKSPACE_ID, 'a.csv', true, fileStream);
      expect(result).toBe(true);
    });

    it('uploads successfully when file does not exist and replace is false', async () => {
      const { service, jupyterService } = makeService();
      jupyterService.fileExists.mockResolvedValue(false);
      jupyterService.putFile.mockResolvedValue('ok');

      const result = await service.uploadFile(WORKSPACE_ID, 'a.csv', false, fileStream);

      expect(result).toBe(true);
    });

    it('throws when putFile reports the file already exists', async () => {
      const { service, jupyterService } = makeService();
      jupyterService.putFile.mockResolvedValue('already-exists');

      await expect(service.uploadFile(WORKSPACE_ID, 'a.csv', true, fileStream)).rejects.toThrow(
        'File already exists',
      );
    });
  });

  describe('deleteFile', () => {
    it('ensures jupyter is running and deletes the file', async () => {
      const { service, jupyterService } = makeService();

      const result = await service.deleteFile({ workspaceId: WORKSPACE_ID, path: 'a.csv' } as any);

      expect(jupyterService.ensureRunning).toHaveBeenCalledWith(WORKSPACE_ID);
      expect(jupyterService.deleteFile).toHaveBeenCalledWith(WORKSPACE_ID, 'a.csv');
      expect(result).toBe(true);
    });
  });

  describe('fileExists', () => {
    it('ensures jupyter is running and checks existence', async () => {
      const { service, jupyterService } = makeService();
      jupyterService.fileExists.mockResolvedValue(true);

      const result = await service.fileExists(WORKSPACE_ID, 'a.csv');

      expect(jupyterService.ensureRunning).toHaveBeenCalledWith(WORKSPACE_ID);
      expect(jupyterService.fileExists).toHaveBeenCalledWith(WORKSPACE_ID, 'a.csv');
      expect(result).toBe(true);
    });
  });
});
