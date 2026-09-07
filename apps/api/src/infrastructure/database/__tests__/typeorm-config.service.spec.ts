import { TypeOrmConfigService } from '../typeorm-config.service';

function makeService(values: Record<string, unknown>) {
  const configService = {
    get: jest.fn((key: string) => values[key]),
  } as any;

  return new TypeOrmConfigService(configService);
}

const BASE_VALUES = {
  'database.type': 'postgres',
  'database.host': 'localhost',
  'database.port': 5432,
  'database.username': 'user',
  'database.password': 'pass',
  'database.name': 'sandworm',
  'database.synchronize': false,
  'database.logging': false,
  'database.maxConnections': 10,
};

describe('TypeOrmConfigService', () => {
  describe('createTypeOrmOptions', () => {
    it('builds options from config values with ssl disabled', () => {
      const service = makeService({ ...BASE_VALUES, 'database.sslEnabled': false });

      const options = service.createTypeOrmOptions() as any;

      expect(options).toMatchObject({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'user',
        password: 'pass',
        database: 'sandworm',
        synchronize: false,
        dropSchema: false,
        keepConnectionAlive: true,
        poolSize: 10,
      });
      expect(options.ssl).toBeUndefined();
      expect(options.entities).toEqual([expect.stringContaining('*.entity.{ts,js}')]);
      expect(options.logger).toBeDefined();
    });

    it('builds ssl options from config values when ssl is enabled', () => {
      const service = makeService({
        ...BASE_VALUES,
        'database.sslEnabled': true,
        'database.rejectUnauthorized': true,
        'database.ca': 'ca-cert',
        'database.key': 'key',
        'database.cert': 'cert',
      });

      const options = service.createTypeOrmOptions() as any;

      expect(options.ssl).toEqual({
        rejectUnauthorized: true,
        ca: 'ca-cert',
        key: 'key',
        cert: 'cert',
      });
    });

    it('defaults ssl ca/key/cert to undefined when not configured', () => {
      const service = makeService({
        ...BASE_VALUES,
        'database.sslEnabled': true,
        'database.rejectUnauthorized': false,
      });

      const options = service.createTypeOrmOptions() as any;

      expect(options.ssl).toEqual({
        rejectUnauthorized: false,
        ca: undefined,
        key: undefined,
        cert: undefined,
      });
    });
  });
});
