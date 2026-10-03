import { DataSourceId, DataSourceName, DataSourceType } from '@sandworm/types';
import { SandwormCloudDataSourceService } from '../sandworm-cloud-datasource.service';

function makeService(configured: boolean, ping = jest.fn()) {
  return new SandwormCloudDataSourceService({ isConfigured: configured, ping } as any);
}

describe('SandwormCloudDataSourceService', () => {
  describe('getDataSource', () => {
    it('is enabled and online when configured', () => {
      const result = makeService(true).getDataSource('w1');

      expect(result.type).toBe(DataSourceType.sandwormCloud);
      expect(result.data).toMatchObject({
        id: DataSourceId.sandwormCloud,
        workspaceId: 'w1',
        name: DataSourceName.sandwormCloud,
        disabled: false,
        connStatus: 'online',
        connError: null,
      });
    });

    it('is disabled and offline when not configured', () => {
      const result = makeService(false).getDataSource('w1');

      expect(result.data).toMatchObject({ disabled: true, connStatus: 'offline' });
    });
  });

  describe('ping', () => {
    it('reports online when the database answers', async () => {
      const result = await makeService(true, jest.fn().mockResolvedValue(undefined)).ping();

      expect(result.connStatus).toBe('online');
    });

    it('reports offline with the error when it does not', async () => {
      const result = await makeService(true, jest.fn().mockRejectedValue(new Error('boom'))).ping();

      expect(result).toMatchObject({ connStatus: 'offline', connError: { name: 'ConnectionError', message: 'boom' } });
    });
  });

  describe('canRunSql', () => {
    it('is true when configured and the database answers', async () => {
      expect(await makeService(true, jest.fn().mockResolvedValue(undefined)).canRunSql()).toBe(true);
    });

    it('is false when not configured, without pinging', async () => {
      const ping = jest.fn();

      expect(await makeService(false, ping).canRunSql()).toBe(false);
      expect(ping).not.toHaveBeenCalled();
    });

    it('is false when the database does not answer', async () => {
      expect(await makeService(true, jest.fn().mockRejectedValue(new Error('boom'))).canRunSql()).toBe(false);
    });
  });
});
