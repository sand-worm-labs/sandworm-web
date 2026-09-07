jest.mock('axios');

import axios from 'axios';
import { Readable } from 'stream';
import { SandwormJupyterExtension } from '../Jupyter.extension.js';

const mockedAxios = axios as jest.Mocked<typeof axios>;

function makeExtension() {
  return new SandwormJupyterExtension('http', 'localhost', 8888, 'tok');
}

const FILE_STAT = {
  name: 'a.txt',
  path: '/cwd/a.txt',
  size: 10,
  modified: 1000,
  created: 900,
  mimeType: 'text/plain',
  isDirectory: false,
};

describe('SandwormJupyterExtension', () => {
  afterEach(() => jest.clearAllMocks());

  describe('statFile', () => {
    it('returns success with the parsed file stat', async () => {
      mockedAxios.get.mockResolvedValue({ status: 200, data: FILE_STAT });
      const ext = makeExtension();

      const result = await ext.statFile('/cwd/a.txt');

      expect(result).toEqual({ _tag: 'success', file: FILE_STAT });
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/sandworm/files/stat?'),
        expect.objectContaining({ headers: { Authorization: 'token tok' } }),
      );
    });

    it('returns a not-found error on a 404', async () => {
      mockedAxios.get.mockResolvedValue({ status: 404, data: {} });
      const ext = makeExtension();

      await expect(ext.statFile('/cwd/missing.txt')).resolves.toEqual({ _tag: 'error', reason: 'not-found' });
    });

    it('returns an is-directory error on a 400', async () => {
      mockedAxios.get.mockResolvedValue({ status: 400, data: { reason: 'is-directory' } });
      const ext = makeExtension();

      await expect(ext.statFile('/cwd/dir')).resolves.toEqual({ _tag: 'error', reason: 'is-directory' });
    });
  });

  describe('listFiles', () => {
    it('returns success with the parsed file list', async () => {
      mockedAxios.get.mockResolvedValue({ status: 200, data: [FILE_STAT] });
      const ext = makeExtension();

      await expect(ext.listFiles('/cwd')).resolves.toEqual({ _tag: 'success', files: [FILE_STAT] });
    });

    it('returns a not-directory error on a 400', async () => {
      mockedAxios.get.mockResolvedValue({ status: 400, data: { reason: 'not-directory' } });
      const ext = makeExtension();

      await expect(ext.listFiles('/cwd/file.txt')).resolves.toEqual({ _tag: 'error', reason: 'not-directory' });
    });
  });

  describe('readFile', () => {
    it('returns not-found without a second request when statFile reports not-found', async () => {
      mockedAxios.get.mockResolvedValueOnce({ status: 404, data: {} });
      const ext = makeExtension();

      await expect(ext.readFile('/cwd/missing.txt')).resolves.toEqual({ _tag: 'error', reason: 'not-found' });
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    it('returns is-directory when the target is a directory', async () => {
      mockedAxios.get.mockResolvedValueOnce({ status: 200, data: { ...FILE_STAT, isDirectory: true } });
      const ext = makeExtension();

      await expect(ext.readFile('/cwd/dir')).resolves.toEqual({ _tag: 'error', reason: 'is-directory' });
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    it('returns the stream and size on success', async () => {
      const stream = new Readable({ read() {} });
      mockedAxios.get
        .mockResolvedValueOnce({ status: 200, data: FILE_STAT })
        .mockResolvedValueOnce({ status: 200, data: stream });
      const ext = makeExtension();

      const result = await ext.readFile('/cwd/a.txt');

      expect(result).toEqual({ _tag: 'success', size: FILE_STAT.size, stream });
    });
  });

  describe('writeFile', () => {
    it('returns success on a normal write', async () => {
      mockedAxios.post.mockResolvedValue({ status: 200, data: {} });
      const ext = makeExtension();

      await expect(ext.writeFile('/cwd/a.txt', new Readable({ read() {} }))).resolves.toEqual({ _tag: 'success' });
    });

    it('returns is-directory when the target path is a directory', async () => {
      mockedAxios.post.mockResolvedValue({ status: 400, data: { reason: 'is-directory' } });
      const ext = makeExtension();

      await expect(ext.writeFile('/cwd/dir', new Readable({ read() {} }))).resolves.toEqual({
        _tag: 'error',
        reason: 'is-directory',
      });
    });
  });

  describe('deleteFile', () => {
    it('returns success on a normal delete', async () => {
      mockedAxios.delete.mockResolvedValue({ status: 200, data: {} });
      const ext = makeExtension();

      await expect(ext.deleteFile('/cwd/a.txt')).resolves.toEqual({ _tag: 'success' });
    });

    it('returns not-found on a 404', async () => {
      mockedAxios.delete.mockResolvedValue({ status: 404, data: {} });
      const ext = makeExtension();

      await expect(ext.deleteFile('/cwd/missing.txt')).resolves.toEqual({ _tag: 'error', reason: 'not-found' });
    });
  });

  describe('getCWD', () => {
    it('returns the cwd string on success', async () => {
      mockedAxios.get.mockResolvedValue({ status: 200, data: { cwd: '/cwd' } });
      const ext = makeExtension();

      await expect(ext.getCWD()).resolves.toBe('/cwd');
    });

    it('throws when the status is not 200', async () => {
      mockedAxios.get.mockResolvedValue({ status: 500, data: {} });
      const ext = makeExtension();

      await expect(ext.getCWD()).rejects.toThrow('Failed to get CWD. Status: 500');
    });
  });
});
