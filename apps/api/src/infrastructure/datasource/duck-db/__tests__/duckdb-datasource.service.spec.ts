import { DataSourceId, DataSourceName, DataSourceType } from '@sandworm/types';
import { DuckDBDataSourceService } from '../duckdb-datasource.service';

describe('DuckDBDataSourceService', () => {
  describe('getDataSource', () => {
    it('returns a static, always-online duckdb data source descriptor', () => {
      const service = new DuckDBDataSourceService();

      const result = service.getDataSource('w1');

      expect(result.type).toBe(DataSourceType.duckdb);
      expect(result.data).toMatchObject({
        id: DataSourceId.duckdb,
        workspaceId: 'w1',
        name: DataSourceName.duckdb,
        connStatus: 'online',
        connError: null,
        isDefault: true,
        isDemo: false,
        path: ':memory:',
        readOnly: true,
      });
    });
  });

  describe('ping', () => {
    it('resolves without throwing', async () => {
      const service = new DuckDBDataSourceService();

      await expect(service.ping()).resolves.toBeUndefined();
    });
  });
});
