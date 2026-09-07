import { Readable } from 'stream';
import { readToString } from '../streams';

describe('readToString', () => {
  it('concatenates all chunks emitted by the stream', async () => {
    const stream = Readable.from(['hello ', 'world']);

    await expect(readToString(stream)).resolves.toBe('hello world');
  });

  it('resolves to an empty string for a stream with no data', async () => {
    const stream = Readable.from([]);

    await expect(readToString(stream)).resolves.toBe('');
  });

  it('rejects when the stream emits an error', async () => {
    const stream = new Readable({
      read() {
        this.emit('error', new Error('boom'));
      },
    });

    await expect(readToString(stream)).rejects.toThrow('boom');
  });

  it('stringifies buffer chunks', async () => {
    const stream = Readable.from([Buffer.from('buf-data')]);

    await expect(readToString(stream)).resolves.toBe('buf-data');
  });
});
