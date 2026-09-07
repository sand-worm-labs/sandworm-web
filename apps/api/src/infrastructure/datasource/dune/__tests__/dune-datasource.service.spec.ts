import { ForbiddenException } from '@nestjs/common';
import { DataSourceId, DataSourceName, DataSourceType } from '@sandworm/types';
import { DuneDataSourceService } from '../dune-datasource.service';

const CONFIGURED_TRINO = { host: 'trino.local', catalog: 'dune', user: 'sandworm' };
const UNCONFIGURED_TRINO = { host: undefined, catalog: undefined, user: undefined };

function makeService(trinoConfig: Record<string, unknown> = CONFIGURED_TRINO) {
  const configService = { getOrThrow: jest.fn(() => trinoConfig) } as any;
  const trinoQueryService = { executeQuery: jest.fn() } as any;
  const service = new DuneDataSourceService(configService, trinoQueryService);
  return { service, configService, trinoQueryService };
}

describe('DuneDataSourceService', () => {
  describe('getDataSource', () => {
    it('reports "checking" status and no connError when trino is configured', () => {
      const { service } = makeService(CONFIGURED_TRINO);

      const result = service.getDataSource('w1');

      expect(result.type).toBe(DataSourceType.dune);
      expect(result.data).toMatchObject({
        id: DataSourceId.dune,
        workspaceId: 'w1',
        name: DataSourceName.dune,
        connStatus: 'checking',
        connError: null,
        readOnly: true,
      });
    });

    it('reports "offline" status with a connError when trino is not configured', () => {
      const { service } = makeService(UNCONFIGURED_TRINO);

      const result = service.getDataSource('w1');

      expect(result.data.connStatus).toBe('offline');
      expect(result.data.connError).toEqual({
        name: 'NotConfigured',
        message: 'TRINO_HOST/TRINO_CATALOG/TRINO_USER are not set',
      });
    });
  });

  describe('ping', () => {
    it('returns online with a lastConnection when configured', async () => {
      const { service } = makeService(CONFIGURED_TRINO);

      const result = await service.ping();

      expect(result.connStatus).toBe('online');
      expect(result).toHaveProperty('lastConnection');
    });

    it('returns offline with a NotConfigured error when not configured', async () => {
      const { service } = makeService(UNCONFIGURED_TRINO);

      const result = await service.ping();

      expect(result).toEqual({
        connStatus: 'offline',
        connError: { name: 'NotConfigured', message: 'TRINO_HOST/TRINO_CATALOG/TRINO_USER are not set' },
      });
    });
  });

  describe('executeQuery', () => {
    it('adds a row limit and delegates to TrinoQueryService', async () => {
      const { service, trinoQueryService } = makeService();
      trinoQueryService.executeQuery.mockResolvedValue({ columns: ['a'], rows: [[1]] });

      const result = await service.executeQuery('SELECT * FROM t', 'u1', 'w1');

      expect(trinoQueryService.executeQuery).toHaveBeenCalledWith('w1', 'dune-query-u1', 'SELECT * FROM t LIMIT 10000');
      expect(result).toEqual({ columns: ['a'], rows: [[1]] });
    });

    it('does not append LIMIT when the query already has one', async () => {
      const { service, trinoQueryService } = makeService();
      trinoQueryService.executeQuery.mockResolvedValue({ columns: [], rows: [] });

      await service.executeQuery('SELECT * FROM t LIMIT 5', 'u1', 'w1');

      expect(trinoQueryService.executeQuery).toHaveBeenCalledWith('w1', 'dune-query-u1', 'SELECT * FROM t LIMIT 5');
    });

    it.each(['DROP TABLE t', 'DELETE FROM t', 'UPDATE t SET x=1', 'INSERT INTO t VALUES (1)', 'ALTER TABLE t', 'TRUNCATE t', 'CREATE TABLE t (id int)'])(
      'rejects a mutating statement: %s',
      async (query) => {
        const { service, trinoQueryService } = makeService();

        await expect(service.executeQuery(query, 'u1', 'w1')).rejects.toThrow(ForbiddenException);
        expect(trinoQueryService.executeQuery).not.toHaveBeenCalled();
      },
    );
  });
});
