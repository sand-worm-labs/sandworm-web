// RedisPubSubAdapter connects to a real Redis server on construction — mock
// the ioredis client so the test never opens a real connection.
const mockRedisInstances: any[] = [];
jest.mock('ioredis', () => ({
  Redis: jest.fn().mockImplementation(function (this: any) {
    this.publish = jest.fn();
    this.subscribe = jest.fn();
    this.on = jest.fn();
    mockRedisInstances.push(this);
    return this;
  }),
}));

import { RedisPubSubAdapter } from '../redis-pub-sub.adapter';

describe('RedisPubSubAdapter', () => {
  beforeEach(() => {
    mockRedisInstances.length = 0;
  });

  function makeAdapter() {
    const adapter = new RedisPubSubAdapter();
    const [redis, subscriber] = mockRedisInstances;
    return { adapter, redis, subscriber };
  }

  describe('constructor', () => {
    it('creates a redis client and a separate subscriber client', () => {
      makeAdapter();

      expect(mockRedisInstances).toHaveLength(2);
    });
  });

  describe('emit', () => {
    it('publishes the event/data envelope on the app:emit channel', () => {
      const { adapter, redis } = makeAdapter();

      adapter.emit('user.created', { id: '1' });

      expect(redis.publish).toHaveBeenCalledWith(
        'app:emit',
        JSON.stringify({ event: 'user.created', data: { id: '1' } }),
      );
    });

    it('throws when the redis client was not initialized', () => {
      const { adapter } = makeAdapter();
      (adapter as any).redis = null;

      expect(() => adapter.emit('user.created', {})).toThrow('Redis not initialized');
    });
  });

  describe('broadcast', () => {
    it('publishes on a channel:event key', () => {
      const { adapter, redis } = makeAdapter();

      adapter.broadcast('workspace-1', 'update', { x: 1 });

      expect(redis.publish).toHaveBeenCalledWith('workspace-1:update', JSON.stringify({ x: 1 }));
    });
  });

  describe('broadcastToRoom', () => {
    it('publishes on a room:<room>:<event> key', () => {
      const { adapter, redis } = makeAdapter();

      adapter.broadcastToRoom('room-1', 'update', { x: 1 });

      expect(redis.publish).toHaveBeenCalledWith('room:room-1:update', JSON.stringify({ x: 1 }));
    });
  });

  describe('on', () => {
    it('subscribes to the channel and dispatches matching messages to the handler', () => {
      const { adapter, subscriber } = makeAdapter();
      const handler = jest.fn();

      adapter.on('user.created', handler);

      expect(subscriber.subscribe).toHaveBeenCalledWith('user.created', expect.any(Function));

      const messageListenerCall = subscriber.on.mock.calls.find((call: any[]) => call[0] === 'message');
      expect(messageListenerCall).toBeDefined();
      const [, messageListener] = messageListenerCall;

      messageListener('user.created', JSON.stringify({ id: '1' }));

      expect(handler).toHaveBeenCalledWith({ id: '1' });
    });

    it('does not invoke the handler for messages on a different channel', () => {
      const { adapter, subscriber } = makeAdapter();
      const handler = jest.fn();

      adapter.on('user.created', handler);

      const [, messageListener] = subscriber.on.mock.calls.find((call: any[]) => call[0] === 'message');
      messageListener('other.channel', JSON.stringify({ id: '1' }));

      expect(handler).not.toHaveBeenCalled();
    });

    it('logs an error when the subscribe call fails', () => {
      const { adapter, subscriber } = makeAdapter();
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

      adapter.on('user.created', jest.fn());
      const subscribeCallback = subscriber.subscribe.mock.calls[0][1];
      subscribeCallback(new Error('boom'), undefined);

      expect(errorSpy).toHaveBeenCalledWith('Failed to subscribe:', expect.any(Error));
      errorSpy.mockRestore();
    });

    it('throws when the subscriber client was not initialized', () => {
      const { adapter } = makeAdapter();
      (adapter as any).subscriber = null;

      expect(() => adapter.on('user.created', jest.fn())).toThrow('Redis subscriber not initialized');
    });
  });
});
