import { ForbiddenException } from '@nestjs/common';
import { DataSourceId } from '@sandworm/types';
import { DataSourcesController } from '../datasource.controller';

function makeController(paid = true, duneAllowed = paid) {
  const queryService = { getSchema: jest.fn() } as any;
  const dataSourceService = { getDataSource: jest.fn(), ping: jest.fn() } as any;
  const duckdbDataSourceService = { getDataSource: jest.fn(), ping: jest.fn() } as any;
  const duneDataSourceService = { getDataSource: jest.fn(), ping: jest.fn() } as any;

  const controller = new DataSourcesController(
    queryService,
    dataSourceService,
    duckdbDataSourceService,
    duneDataSourceService,
    { status: jest.fn() } as any,
    { isPaid: jest.fn().mockResolvedValue(paid), canUseDune: jest.fn().mockResolvedValue(duneAllowed) } as any,
  );

  return { controller, queryService, dataSourceService, duckdbDataSourceService, duneDataSourceService };
}

const WORKSPACE_ID = 'w1';

describe('DataSourcesController', () => {
  describe('listDataSources', () => {
    it('aggregates duckdb, sandworm cloud, and dune data sources', async () => {
      const { controller, dataSourceService, duckdbDataSourceService, duneDataSourceService } = makeController();
      duckdbDataSourceService.getDataSource.mockReturnValue({ type: 'duckdb' });
      dataSourceService.getDataSource.mockReturnValue({ type: 'sandworm-cloud' });
      duneDataSourceService.getDataSource.mockReturnValue({ type: 'dune' });

      const result = await controller.listDataSources(WORKSPACE_ID);

      expect(result).toEqual([{ type: 'duckdb' }, { type: 'sandworm-cloud' }, { type: 'dune' }]);
      expect(duckdbDataSourceService.getDataSource).toHaveBeenCalledWith(WORKSPACE_ID);
      expect(dataSourceService.getDataSource).toHaveBeenCalledWith(WORKSPACE_ID);
      expect(duneDataSourceService.getDataSource).toHaveBeenCalledWith(WORKSPACE_ID);
    });
  });

  describe('getDataSource', () => {
    it('delegates to the sandworm cloud service for the sandwormCloud id', async () => {
      const { controller, dataSourceService } = makeController();
      dataSourceService.getDataSource.mockReturnValue({ type: 'sandworm-cloud' });

      const result = await controller.getDataSource(WORKSPACE_ID, DataSourceId.sandwormCloud);

      expect(result).toEqual({ type: 'sandworm-cloud' });
      expect(dataSourceService.getDataSource).toHaveBeenCalledWith(WORKSPACE_ID);
    });

    it('delegates to the duckdb service for the duckdb id', async () => {
      const { controller, duckdbDataSourceService } = makeController();
      duckdbDataSourceService.getDataSource.mockReturnValue({ type: 'duckdb' });

      const result = await controller.getDataSource(WORKSPACE_ID, DataSourceId.duckdb);

      expect(result).toEqual({ type: 'duckdb' });
      expect(duckdbDataSourceService.getDataSource).toHaveBeenCalledWith(WORKSPACE_ID);
    });

    it('delegates to the dune service for the dune id', async () => {
      const { controller, duneDataSourceService } = makeController();
      duneDataSourceService.getDataSource.mockReturnValue({ type: 'dune' });

      const result = await controller.getDataSource(WORKSPACE_ID, DataSourceId.dune);

      expect(result).toEqual({ type: 'dune' });
      expect(duneDataSourceService.getDataSource).toHaveBeenCalledWith(WORKSPACE_ID);
    });

    it('throws ForbiddenException for an unknown data source id', async () => {
      const { controller } = makeController();

      await expect(controller.getDataSource(WORKSPACE_ID, 'unknown' as any)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getSchema', () => {
    it('delegates to the query service for the sandwormCloud id', async () => {
      const { controller, queryService } = makeController();
      queryService.getSchema.mockResolvedValue({ tables: new Map() });

      const result = await controller.getSchema(WORKSPACE_ID, DataSourceId.sandwormCloud);

      expect(result).toEqual({ tables: new Map() });
      expect(queryService.getSchema).toHaveBeenCalled();
    });

    it('throws ForbiddenException for a non-sandwormCloud id', async () => {
      const { controller } = makeController();

      await expect(controller.getSchema(WORKSPACE_ID, DataSourceId.duckdb)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('ping', () => {
    it('delegates to the sandworm cloud service for the sandwormCloud id', async () => {
      const { controller, dataSourceService } = makeController();
      dataSourceService.ping.mockResolvedValue({ connStatus: 'online' });

      const result = await controller.ping(WORKSPACE_ID, DataSourceId.sandwormCloud);

      expect(result).toEqual({ connStatus: 'online' });
      expect(dataSourceService.ping).toHaveBeenCalled();
    });

    it('delegates to the duckdb service for the duckdb id', async () => {
      const { controller, duckdbDataSourceService } = makeController();
      duckdbDataSourceService.ping.mockResolvedValue(true);

      const result = await controller.ping(WORKSPACE_ID, DataSourceId.duckdb);

      expect(result).toBe(true);
      expect(duckdbDataSourceService.ping).toHaveBeenCalled();
    });

    it('delegates to the dune service for the dune id', async () => {
      const { controller, duneDataSourceService } = makeController();
      duneDataSourceService.ping.mockResolvedValue({ connStatus: 'online' });

      const result = await controller.ping(WORKSPACE_ID, DataSourceId.dune);

      expect(result).toEqual({ connStatus: 'online' });
      expect(duneDataSourceService.ping).toHaveBeenCalled();
    });

    it('throws ForbiddenException for an unknown data source id', async () => {
      const { controller } = makeController();

      await expect(controller.ping(WORKSPACE_ID, 'unknown' as any)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('without a plan that includes the source', () => {
    const dune = { type: 'dune', data: { id: DataSourceId.dune, name: 'Dune', connStatus: 'checking', connError: null } };
    const cloud = { type: 'sandwormcloud', data: { id: DataSourceId.sandwormCloud, name: 'Sandworm Cloud', connStatus: 'online', connError: null } };

    it('lists Dune and Sandworm Cloud as off, and leaves DuckDB alone', async () => {
      const { controller, dataSourceService, duckdbDataSourceService, duneDataSourceService } = makeController(false);
      duckdbDataSourceService.getDataSource.mockReturnValue({ type: 'duckdb' });
      dataSourceService.getDataSource.mockReturnValue(cloud);
      duneDataSourceService.getDataSource.mockReturnValue(dune);

      const [duckdb, lockedCloud, lockedDune] = (await controller.listDataSources(WORKSPACE_ID)) as any[];

      expect(duckdb).toEqual({ type: 'duckdb' });
      for (const source of [lockedCloud, lockedDune]) {
        expect(source.data).toMatchObject({ disabled: true, connStatus: 'offline', connError: { name: 'PaidPlanRequired' } });
      }
      expect(lockedDune.data.connError.message).toContain('Dune needs the Pro plan');
    });

    it('lists Dune as off but Sandworm Cloud as on for a trial workspace', async () => {
      const { controller, dataSourceService, duckdbDataSourceService, duneDataSourceService } = makeController(true, false);
      duckdbDataSourceService.getDataSource.mockReturnValue({ type: 'duckdb' });
      dataSourceService.getDataSource.mockReturnValue(cloud);
      duneDataSourceService.getDataSource.mockReturnValue(dune);

      const [, trialCloud, lockedDune] = (await controller.listDataSources(WORKSPACE_ID)) as any[];

      expect(trialCloud).toEqual(cloud);
      expect(lockedDune.data).toMatchObject({ disabled: true, connStatus: 'offline', connError: { name: 'PaidPlanRequired' } });
    });

    it('refuses the Sandworm Cloud schema', async () => {
      const { controller, queryService } = makeController(false);

      await expect(controller.getSchema(WORKSPACE_ID, DataSourceId.sandwormCloud)).rejects.toThrow(ForbiddenException);
      expect(queryService.getSchema).not.toHaveBeenCalled();
    });

    it('answers a ping as offline without reaching the source', async () => {
      const { controller, duneDataSourceService } = makeController(false);
      duneDataSourceService.getDataSource.mockReturnValue(dune);

      expect(await controller.ping(WORKSPACE_ID, DataSourceId.dune)).toMatchObject({ connStatus: 'offline', connError: { name: 'PaidPlanRequired' } });
      expect(duneDataSourceService.ping).not.toHaveBeenCalled();
    });
  });
});
