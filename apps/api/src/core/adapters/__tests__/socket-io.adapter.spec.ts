import { SocketIOAdapter } from '../socket-io.adapter';

function makeServer() {
  return {
    emit: jest.fn(),
    on: jest.fn(),
    to: jest.fn().mockReturnThis(),
  } as any;
}

describe('SocketIOAdapter', () => {
  describe('when no server has been set', () => {
    it('throws on emit', () => {
      const adapter = new SocketIOAdapter();

      expect(() => adapter.emit('event', {})).toThrow('Socket.IO server not initialized');
    });

    it('throws on on()', () => {
      const adapter = new SocketIOAdapter();

      expect(() => adapter.on('event', jest.fn())).toThrow('Socket.IO server not initialized');
    });

    it('throws on broadcast', () => {
      const adapter = new SocketIOAdapter();

      expect(() => adapter.broadcast('ch', 'event', {})).toThrow('Socket.IO server not initialized');
    });

    it('throws on broadcastToRoom', () => {
      const adapter = new SocketIOAdapter();

      expect(() => adapter.broadcastToRoom('room', 'event', {})).toThrow(
        'Socket.IO server not initialized',
      );
    });
  });

  describe('once a server is set', () => {
    function makeAdapter() {
      const adapter = new SocketIOAdapter();
      const server = makeServer();
      adapter.setServer(server);
      return { adapter, server };
    }

    it('emit delegates to server.emit', () => {
      const { adapter, server } = makeAdapter();

      adapter.emit('event', { a: 1 });

      expect(server.emit).toHaveBeenCalledWith('event', { a: 1 });
    });

    it('on delegates to server.on', () => {
      const { adapter, server } = makeAdapter();
      const handler = jest.fn();

      adapter.on('event', handler);

      expect(server.on).toHaveBeenCalledWith('event', handler);
    });

    it('broadcast emits on a channel:event namespaced key', () => {
      const { adapter, server } = makeAdapter();

      adapter.broadcast('channel', 'event', { a: 1 });

      expect(server.emit).toHaveBeenCalledWith('channel:event', { a: 1 });
    });

    it('broadcastToRoom emits to the room via server.to(room)', () => {
      const { adapter, server } = makeAdapter();

      adapter.broadcastToRoom('room-1', 'event', { a: 1 });

      expect(server.to).toHaveBeenCalledWith('room-1');
      expect(server.emit).toHaveBeenCalledWith('event', { a: 1 });
    });
  });
});
