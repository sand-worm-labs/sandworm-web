import { WsException } from '@nestjs/websockets';
import { WsExceptionFilter } from '../ws-exception.filter';

function makeClient() {
  return { id: 'client-1', emit: jest.fn() };
}

function makeHost(client: any) {
  return {
    switchToWs: () => ({
      getClient: () => client,
    }),
  } as any;
}

describe('WsExceptionFilter', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe('catch', () => {
    it('emits the string error payload for a WsException carrying a string error', () => {
      const filter = new WsExceptionFilter();
      const client = makeClient();

      filter.catch(new WsException('Unauthorized'), makeHost(client));

      expect(client.emit).toHaveBeenCalledWith(
        'error',
        expect.objectContaining({ message: 'Unauthorized' }),
      );
    });

    it('emits the nested message for a WsException carrying an object error', () => {
      const filter = new WsExceptionFilter();
      const client = makeClient();

      filter.catch(new WsException({ message: 'Bad payload' }), makeHost(client));

      expect(client.emit).toHaveBeenCalledWith(
        'error',
        expect.objectContaining({ message: 'Bad payload' }),
      );
    });

    it('falls back to "Unknown error" for a WsException carrying an object with no message', () => {
      const filter = new WsExceptionFilter();
      const client = makeClient();

      filter.catch(new WsException({}), makeHost(client));

      expect(client.emit).toHaveBeenCalledWith(
        'error',
        expect.objectContaining({ message: 'Unknown error' }),
      );
    });

    it('emits the real error message for a plain Error outside production', () => {
      process.env.NODE_ENV = 'test';
      const filter = new WsExceptionFilter();
      const client = makeClient();

      filter.catch(new Error('stack trace leak'), makeHost(client));

      expect(client.emit).toHaveBeenCalledWith(
        'error',
        expect.objectContaining({ message: 'stack trace leak' }),
      );
    });

    it('masks the error message for a plain Error in production', () => {
      process.env.NODE_ENV = 'production';
      const filter = new WsExceptionFilter();
      const client = makeClient();

      filter.catch(new Error('stack trace leak'), makeHost(client));

      expect(client.emit).toHaveBeenCalledWith(
        'error',
        expect.objectContaining({ message: 'Internal server error' }),
      );
    });

    it('emits a generic message for a non-Error, non-WsException thrown value', () => {
      const filter = new WsExceptionFilter();
      const client = makeClient();

      filter.catch('a raw string was thrown', makeHost(client));

      expect(client.emit).toHaveBeenCalledWith(
        'error',
        expect.objectContaining({ message: 'An unexpected error occurred' }),
      );
    });

    it('includes an ISO timestamp on the emitted payload', () => {
      const filter = new WsExceptionFilter();
      const client = makeClient();

      filter.catch(new WsException('Unauthorized'), makeHost(client));

      const [, payload] = client.emit.mock.calls[0];
      expect(() => new Date(payload.timestamp).toISOString()).not.toThrow();
    });
  });
});
