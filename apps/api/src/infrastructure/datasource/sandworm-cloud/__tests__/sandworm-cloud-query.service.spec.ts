import { ForbiddenException } from '@nestjs/common';
import { SandwormCloudQueryService } from '../sandworm-cloud-query.service';

const mockConnection = { isInitialized: false, initialize: jest.fn(), query: jest.fn(), destroy: jest.fn() };
jest.mock('typeorm', () => ({ ...jest.requireActual('typeorm'), DataSource: jest.fn(() => mockConnection) }));

function makeService(env: Record<string, string> = { SANDWORM_CLOUD_DB_HOST: 'db.example.com' }) {
  return new SandwormCloudQueryService({ get: (k: string) => env[k] } as any);
}

describe('SandwormCloudQueryService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('is unconfigured without a host and refuses to connect', async () => {
    const service = makeService({});

    expect(service.isConfigured).toBe(false);
    await expect(service.ping()).rejects.toThrow(ForbiddenException);
  });

  it('pings with SELECT 1', async () => {
    await makeService().ping();

    expect(mockConnection.initialize).toHaveBeenCalled();
    expect(mockConnection.query).toHaveBeenCalledWith('SELECT 1');
  });

  describe('getSchema', () => {
    it('groups information_schema columns by schema and table', async () => {
      mockConnection.query.mockResolvedValue([
        { table_schema: 'public', table_name: 't', column_name: 'id', data_type: 'bigint' },
        { table_schema: 'public', table_name: 't', column_name: 'name', data_type: 'text' },
      ]);

      const result = await makeService().getSchema();

      expect(result).toEqual({
        defaultSchema: 'public',
        tables: { public: { t: { columns: [{ name: 'id', type: 'bigint' }, { name: 'name', type: 'text' }] } } },
      });
    });
  });
});
