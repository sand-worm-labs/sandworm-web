// IoAdapter/WsAdapter construct real HTTP/WS server plumbing from an
// INestApplication — mock both so the adapter can be built from a plain object.
jest.mock('@nestjs/platform-socket.io', () => ({
  IoAdapter: jest.fn().mockImplementation(() => ({
    create: jest.fn(),
    bindClientConnect: jest.fn(),
    bindClientDisconnect: jest.fn(),
    bindMessageHandlers: jest.fn(),
    close: jest.fn(),
  })),
}));
jest.mock('@nestjs/platform-ws', () => ({
  WsAdapter: jest.fn().mockImplementation(() => ({
    create: jest.fn(),
    bindClientConnect: jest.fn(),
    bindClientDisconnect: jest.fn(),
    bindMessageHandlers: jest.fn(),
    close: jest.fn(),
  })),
}));

import * as SocketIO from 'socket.io';
import * as WebSocket from 'ws';
import { UnifiedSocketAdapter, SocketServerType } from '../unified-socket.adapter';

// Objects that pass `instanceof` checks without invoking the real constructors.
function fakeSocketIOServer() {
  return Object.create(SocketIO.Server.prototype);
}
function fakeSocketIONamespace() {
  return Object.create(SocketIO.Namespace.prototype);
}
function fakeSocketIOSocket() {
  return Object.create(SocketIO.Socket.prototype);
}
function fakeWsServer() {
  return Object.create(WebSocket.Server.prototype);
}
function fakeWsSocket() {
  return Object.create(WebSocket.WebSocket.prototype);
}

function makeAdapter() {
  const adapter = new UnifiedSocketAdapter({} as any);
  const ioAdapter = (adapter as any).ioAdapter;
  const wsAdapter = (adapter as any).wsAdapter;
  return { adapter, ioAdapter, wsAdapter };
}

describe('UnifiedSocketAdapter', () => {
  describe('create', () => {
    it('throws when options.type is missing', () => {
      const { adapter } = makeAdapter();

      expect(() => adapter.create(3000, {})).toThrow(
        'Socket server type must be specified in options',
      );
    });

    it('delegates to the socket.io adapter for SOCKET_IO type', () => {
      const { adapter, ioAdapter } = makeAdapter();
      const server = fakeSocketIOServer();
      ioAdapter.create.mockReturnValue(server);

      const result = adapter.create(3000, { type: SocketServerType.SOCKET_IO, path: '/ws' });

      expect(ioAdapter.create).toHaveBeenCalledWith(3000, { path: '/ws' });
      expect(result).toBe(server);
    });

    it('delegates to the ws adapter for WEBSOCKET type', () => {
      const { adapter, wsAdapter } = makeAdapter();
      const server = fakeWsServer();
      wsAdapter.create.mockReturnValue(server);

      const result = adapter.create(3000, { type: SocketServerType.WEBSOCKET });

      expect(wsAdapter.create).toHaveBeenCalledWith(3000, {});
      expect(result).toBe(server);
    });

    it('throws for an unknown server type', () => {
      const { adapter } = makeAdapter();

      expect(() => adapter.create(3000, { type: 'carrier-pigeon' })).toThrow(
        'Unknown server type: carrier-pigeon',
      );
    });
  });

  describe('bindClientConnect', () => {
    it('uses the stored type from create() to route to the socket.io adapter', () => {
      const { adapter, ioAdapter } = makeAdapter();
      const server = fakeSocketIOServer();
      ioAdapter.create.mockReturnValue(server);
      adapter.create(3000, { type: SocketServerType.SOCKET_IO });
      const callback = jest.fn();

      adapter.bindClientConnect(server, callback);

      expect(ioAdapter.bindClientConnect).toHaveBeenCalledWith(server, callback);
    });

    it('uses the stored type from create() to route to the ws adapter', () => {
      const { adapter, wsAdapter } = makeAdapter();
      const server = fakeWsServer();
      wsAdapter.create.mockReturnValue(server);
      adapter.create(3000, { type: SocketServerType.WEBSOCKET });
      const callback = jest.fn();

      adapter.bindClientConnect(server, callback);

      expect(wsAdapter.bindClientConnect).toHaveBeenCalledWith(server, callback);
    });

    it('falls back to an instanceof check for a socket.io Namespace never registered via create()', () => {
      const { adapter, ioAdapter } = makeAdapter();
      const namespace = fakeSocketIONamespace();
      const callback = jest.fn();

      adapter.bindClientConnect(namespace, callback);

      expect(ioAdapter.bindClientConnect).toHaveBeenCalledWith(namespace, callback);
    });

    it('falls back to an instanceof check for a ws Server never registered via create()', () => {
      const { adapter, wsAdapter } = makeAdapter();
      const server = fakeWsServer();
      const callback = jest.fn();

      adapter.bindClientConnect(server, callback);

      expect(wsAdapter.bindClientConnect).toHaveBeenCalledWith(server, callback);
    });

    it('throws for an unrecognized server', () => {
      const { adapter } = makeAdapter();
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

      expect(() => adapter.bindClientConnect({}, jest.fn())).toThrow(
        'Unknown server type in bindClientConnect',
      );

      errorSpy.mockRestore();
    });
  });

  describe('bindClientDisconnect', () => {
    it('routes a socket.io client to the socket.io adapter', () => {
      const { adapter, ioAdapter } = makeAdapter();
      const client = fakeSocketIOSocket();
      const callback = jest.fn();

      adapter.bindClientDisconnect(client, callback);

      expect(ioAdapter.bindClientDisconnect).toHaveBeenCalledWith(client, callback);
    });

    it('routes a ws client to the ws adapter', () => {
      const { adapter, wsAdapter } = makeAdapter();
      const client = fakeWsSocket();
      const callback = jest.fn();

      adapter.bindClientDisconnect(client, callback);

      expect(wsAdapter.bindClientDisconnect).toHaveBeenCalledWith(client, callback);
    });

    it('throws for an unrecognized client', () => {
      const { adapter } = makeAdapter();
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

      expect(() => adapter.bindClientDisconnect({}, jest.fn())).toThrow(
        'Unknown client type in bindClientDisconnect',
      );

      errorSpy.mockRestore();
    });
  });

  describe('bindMessageHandlers', () => {
    it('routes a socket.io client to the socket.io adapter', () => {
      const { adapter, ioAdapter } = makeAdapter();
      const client = fakeSocketIOSocket();
      const handlers = [{}];
      const transform = (d: any) => d;

      adapter.bindMessageHandlers(client, handlers, transform);

      expect(ioAdapter.bindMessageHandlers).toHaveBeenCalledWith(client, handlers, transform);
    });

    it('routes a ws client to the ws adapter', () => {
      const { adapter, wsAdapter } = makeAdapter();
      const client = fakeWsSocket();
      const handlers = [{}];
      const transform = (d: any) => d;

      adapter.bindMessageHandlers(client, handlers, transform);

      expect(wsAdapter.bindMessageHandlers).toHaveBeenCalledWith(client, handlers, transform);
    });

    it('throws for an unrecognized client', () => {
      const { adapter } = makeAdapter();
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

      expect(() => adapter.bindMessageHandlers({}, [], (d) => d)).toThrow(
        'Unknown client type in bindMessageHandlers',
      );

      errorSpy.mockRestore();
    });
  });

  describe('close', () => {
    it('closes and forgets a registered socket.io server', () => {
      const { adapter, ioAdapter } = makeAdapter();
      const server = fakeSocketIOServer();
      ioAdapter.create.mockReturnValue(server);
      adapter.create(3000, { type: SocketServerType.SOCKET_IO });

      adapter.close(server);

      expect(ioAdapter.close).toHaveBeenCalledWith(server);
      // The type mapping was forgotten, so a second close falls through to the
      // plain instanceof check (still socket.io, since Server extends it).
      adapter.close(server);
      expect(ioAdapter.close).toHaveBeenCalledTimes(2);
    });

    it('closes a registered ws server', () => {
      const { adapter, wsAdapter } = makeAdapter();
      const server = fakeWsServer();
      wsAdapter.create.mockReturnValue(server);
      adapter.create(3000, { type: SocketServerType.WEBSOCKET });

      adapter.close(server);

      expect(wsAdapter.close).toHaveBeenCalledWith(server);
    });

    it('throws for an unrecognized server', () => {
      const { adapter } = makeAdapter();
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

      expect(() => adapter.close({})).toThrow('Unknown server type in close');

      errorSpy.mockRestore();
    });
  });
});
