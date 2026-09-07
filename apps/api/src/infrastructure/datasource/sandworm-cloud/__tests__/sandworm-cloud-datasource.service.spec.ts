import { DataSourceId, DataSourceName, DataSourceType } from '@sandworm/types';
import { SandwormCloudDataSourceService } from '../sandworm-cloud-datasource.service';

describe('SandwormCloudDataSourceService', () => {
  describe('getDataSource', () => {
    it('returns a disabled/offline data source descriptor (not yet wired up)', () => {
      const service = new SandwormCloudDataSourceService();

      const result = service.getDataSource('w1');

      expect(result.type).toBe(DataSourceType.sandwormCloud);
      expect(result.data).toMatchObject({
        id: DataSourceId.sandwormCloud,
        workspaceId: 'w1',
        name: DataSourceName.sandwormCloud,
        disabled: true,
        connStatus: 'offline',
        connError: { name: 'NotAvailable', message: 'Sandworm Cloud is not available yet' },
        isDefault: false,
        isDemo: false,
      });
    });
  });

  describe('ping', () => {
    it('always reports online (no real connectivity check implemented yet)', async () => {
      const service = new SandwormCloudDataSourceService();

      const result = await service.ping();

      expect(result.connStatus).toBe('online');
      expect(result).toHaveProperty('lastConnection');
    });
  });
});
