import { HttpStatus } from '@nestjs/common';
import { Readable } from 'stream';
import { FileController } from '../file.controller';

function makeController() {
  const fileService = {
    listFiles: jest.fn(),
    getFile: jest.fn(),
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
  } as any;

  const controller = new FileController(fileService);
  return { controller, fileService };
}

function makeReply() {
  const reply: any = {};
  reply.status = jest.fn(() => reply);
  reply.header = jest.fn(() => reply);
  reply.type = jest.fn(() => reply);
  reply.send = jest.fn(() => reply);
  reply.code = jest.fn(() => reply);
  return reply;
}

const WORKSPACE_ID = 'ws-1';

describe('FileController', () => {
  describe('listFiles', () => {
    it('delegates to service with the workspaceId', async () => {
      const { controller, fileService } = makeController();
      const files = [{ name: 'a.csv' }];
      fileService.listFiles.mockResolvedValue(files);

      const result = await controller.listFiles(WORKSPACE_ID);

      expect(fileService.listFiles).toHaveBeenCalledWith({ workspaceId: WORKSPACE_ID });
      expect(result).toBe(files);
    });
  });

  describe('downloadFile', () => {
    it('returns 400 when no path is given', async () => {
      const { controller } = makeController();
      const reply = makeReply();

      await controller.downloadFile(WORKSPACE_ID, '', reply);

      expect(reply.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(reply.send).toHaveBeenCalled();
    });

    it('returns 404 when the file is not found', async () => {
      const { controller, fileService } = makeController();
      fileService.getFile.mockResolvedValue(null);
      const reply = makeReply();

      await controller.downloadFile(WORKSPACE_ID, 'dir/a.csv', reply);

      expect(reply.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    });

    it('streams the file with headers derived from the basename', async () => {
      const { controller, fileService } = makeController();
      const stream = new Readable();
      fileService.getFile.mockResolvedValue({ stream, size: 99, exitCode: Promise.resolve(0) });
      const reply = makeReply();

      await controller.downloadFile(WORKSPACE_ID, 'dir/a.csv', reply);

      expect(reply.header).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="a.csv"');
      expect(reply.header).toHaveBeenCalledWith('Content-Length', 99);
      expect(reply.type).toHaveBeenCalledWith('application/octet-stream');
      expect(reply.send).toHaveBeenCalledWith(stream);
    });
  });

  describe('uploadFile', () => {
    it('returns 400 when x-file-name header is missing', async () => {
      const { controller, fileService } = makeController();
      const req = { body: Buffer.from('data'), headers: {} } as any;
      const reply = makeReply();

      await controller.uploadFile(WORKSPACE_ID, 'false', req, reply);

      expect(reply.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(fileService.uploadFile).not.toHaveBeenCalled();
    });

    it('uploads the file and returns 204', async () => {
      const { controller, fileService } = makeController();
      const req = { body: Buffer.from('data'), headers: { 'x-file-name': 'a.csv' } } as any;
      const reply = makeReply();
      fileService.uploadFile.mockResolvedValue(true);

      await controller.uploadFile(WORKSPACE_ID, 'true', req, reply);

      expect(fileService.uploadFile).toHaveBeenCalledWith(WORKSPACE_ID, 'a.csv', true, expect.any(Readable));
      expect(reply.code).toHaveBeenCalledWith(HttpStatus.NO_CONTENT);
    });

    it('treats replace as false when the query value is not "true"', async () => {
      const { controller, fileService } = makeController();
      const req = { body: Buffer.from('data'), headers: { 'x-file-name': 'a.csv' } } as any;
      const reply = makeReply();
      fileService.uploadFile.mockResolvedValue(true);

      await controller.uploadFile(WORKSPACE_ID, undefined as any, req, reply);

      expect(fileService.uploadFile).toHaveBeenCalledWith(WORKSPACE_ID, 'a.csv', false, expect.any(Readable));
    });
  });

  describe('deleteFile', () => {
    it('throws BAD_REQUEST when no path is given', async () => {
      const { controller, fileService } = makeController();

      await expect(controller.deleteFile(WORKSPACE_ID, '')).rejects.toThrow('File path is required');
      expect(fileService.deleteFile).not.toHaveBeenCalled();
    });

    it('delegates to service when path is given', async () => {
      const { controller, fileService } = makeController();

      await controller.deleteFile(WORKSPACE_ID, 'a.csv');

      expect(fileService.deleteFile).toHaveBeenCalledWith({ workspaceId: WORKSPACE_ID, path: 'a.csv' });
    });
  });
});
