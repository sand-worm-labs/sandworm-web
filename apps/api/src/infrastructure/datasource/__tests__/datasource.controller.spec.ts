import { ForbiddenException } from '@nestjs/common';
import { DataSourceId } from '@sandworm/types';
import { DataSourcesController } from '../datasource.controller';

function makeController() {
  const queryService = { getSchema: jest.fn() } as any;
  const dataSourceService = { getDataSource: jest.fn(), ping: jest.fn() } as any;
  const duckdbDataSourceService = { getDataSource: jest.fn(), ping: jest.fn() } as any;
  const duneDataSourceService = { getDataSource: jest.fn(), ping: jest.fn() } as any;

  const controller = new DataSourcesController(
    queryService,
    dataSourceService,
    duckdbDataSourceService,
    duneDataSourceService,
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
});
