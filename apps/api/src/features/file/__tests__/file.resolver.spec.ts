import { FileResolver } from '../file.resolver';

function makeResolver() {
  const fileService = {
    listFiles: jest.fn(),
    fileExists: jest.fn(),
    deleteFile: jest.fn(),
  } as any;

  const resolver = new FileResolver(fileService);
  return { resolver, fileService };
}

const WORKSPACE_ID = 'ws-1';

describe('FileResolver', () => {
  describe('listFiles', () => {
    it('delegates to service with workspaceId and path from input', async () => {
      const { resolver, fileService } = makeResolver();
      const files = [{ name: 'a.csv' }];
      fileService.listFiles.mockResolvedValue(files);

      const result = await resolver.listFiles({ workspaceId: WORKSPACE_ID, path: '/dir' } as any);

      expect(fileService.listFiles).toHaveBeenCalledWith({ workspaceId: WORKSPACE_ID, path: '/dir' });
      expect(result).toBe(files);
    });
  });

  describe('fileExists', () => {
    it('delegates to service', async () => {
      const { resolver, fileService } = makeResolver();
      fileService.fileExists.mockResolvedValue(true);

      const result = await resolver.fileExists(WORKSPACE_ID, 'a.csv');

      expect(fileService.fileExists).toHaveBeenCalledWith(WORKSPACE_ID, 'a.csv');
      expect(result).toBe(true);
    });
  });

  describe('deleteFile', () => {
    it('delegates to service and always returns true', async () => {
      const { resolver, fileService } = makeResolver();
      fileService.deleteFile.mockResolvedValue(true);

      const result = await resolver.deleteFile({ workspaceId: WORKSPACE_ID, path: 'a.csv' } as any);

      expect(fileService.deleteFile).toHaveBeenCalledWith({ workspaceId: WORKSPACE_ID, path: 'a.csv' });
      expect(result).toBe(true);
    });
  });
});
