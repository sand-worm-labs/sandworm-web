// PubSubService wraps Postgres LISTEN/NOTIFY primitives from
// @sandworm/postgresql-typeorm — mock them so no real Postgres connection is
// ever opened.
jest.mock('@sandworm/postgresql-typeorm', () => ({
  publish: jest.fn(),
  subscribe: jest.fn(),
  initPubSub: jest.fn(),
}));

import { publish, subscribe, initPubSub } from '@sandworm/postgresql-typeorm';
import { PubSubService } from '../pubsub.service';

const DB_CONFIG = {
  username: 'user',
  password: 'pass',
  host: 'db.local',
  port: 5432,
  name: 'sandworm',
  sslEnabled: false,
  rejectUnauthorized: true,
  ca: undefined,
};

function makeService(dbConfig: Record<string, unknown> = DB_CONFIG) {
  const configService = { get: jest.fn(() => dbConfig) } as any;
  const service = new PubSubService(configService);
  return { service, configService };
}

describe('PubSubService', () => {
  afterEach(() => jest.clearAllMocks());

  describe('onModuleInit', () => {
    it('initializes pubsub with a connection string built from the database config, ssl disabled', async () => {
      const { service } = makeService();

      await service.onModuleInit();

      expect(initPubSub).toHaveBeenCalledWith({
        connectionString: 'postgresql://user:pass@db.local:5432/sandworm',
        ssl: false,
      });
    });

    it('enables ssl with rejectUnauthorized/ca when sslEnabled is set', async () => {
      const { service } = makeService({ ...DB_CONFIG, sslEnabled: true, ca: 'ca-cert' });

      await service.onModuleInit();

      expect(initPubSub).toHaveBeenCalledWith(
        expect.objectContaining({ ssl: { rejectUnauthorized: true, ca: 'ca-cert' } }),
      );
    });
  });

  describe('publish', () => {
    it('delegates to the postgresql-typeorm publish function', async () => {
      const { service } = makeService();

      await service.publish('chan', 'msg');

      expect(publish).toHaveBeenCalledWith('chan', 'msg');
    });
  });

  describe('subscribe', () => {
    it('delegates to the postgresql-typeorm subscribe function and tracks the cleanup', async () => {
      const { service } = makeService();
      const underlyingCleanup = jest.fn().mockResolvedValue(undefined);
      (subscribe as jest.Mock).mockResolvedValue(underlyingCleanup);
      const callback = jest.fn();

      const cleanup = await service.subscribe('chan', callback);

      expect(subscribe).toHaveBeenCalledWith('chan', callback);
      expect((service as any).subscriptions.has(underlyingCleanup)).toBe(true);

      await cleanup();

      expect(underlyingCleanup).toHaveBeenCalled();
      expect((service as any).subscriptions.has(underlyingCleanup)).toBe(false);
    });
  });

  describe('onModuleDestroy', () => {
    it('runs all tracked cleanups and clears the subscription set', async () => {
      const { service } = makeService();
      const cleanup1 = jest.fn().mockResolvedValue(undefined);
      const cleanup2 = jest.fn().mockResolvedValue(undefined);
      (service as any).subscriptions.add(cleanup1);
      (service as any).subscriptions.add(cleanup2);

      await service.onModuleDestroy();

      expect(cleanup1).toHaveBeenCalled();
      expect(cleanup2).toHaveBeenCalled();
      expect((service as any).subscriptions.size).toBe(0);
    });
  });
});
