import {
    Controller,
    Get,
    Post,
    Param,
    ForbiddenException,
} from '@nestjs/common';
import { DataSourceId } from '@sandworm/types';
import { SandwormCloudDataSourceService } from './sandworm-cloud/sandworm-cloud-datasource.service';
import { SandwormCloudQueryService } from './sandworm-cloud/sandworm-cloud-query.service';
import { DuckDBDataSourceService } from './duck-db/duckdb-datasource.service';
import { DuneDataSourceService } from './dune/dune-datasource.service';

@Controller('v1/workspaces/:workspaceId/data-sources')
export class DataSourcesController {
    constructor(
        private readonly queryService: SandwormCloudQueryService,
        private readonly dataSourceService: SandwormCloudDataSourceService,
        private readonly duckdbDataSourceService: DuckDBDataSourceService,
        private readonly duneDataSourceService: DuneDataSourceService,
    ) {}

    @Get()
    async listDataSources(@Param('workspaceId') workspaceId: string) {
        return [
            this.duckdbDataSourceService.getDataSource(workspaceId),
            this.dataSourceService.getDataSource(workspaceId),
            this.duneDataSourceService.getDataSource(workspaceId),
        ];
    }

    @Get(':dataSourceId')
    async getDataSource(
        @Param('workspaceId') workspaceId: string,
        @Param('dataSourceId') dataSourceId: string,
    ) {
        if (dataSourceId === DataSourceId.sandwormCloud) {
            return this.dataSourceService.getDataSource(workspaceId);
        }
        if (dataSourceId === DataSourceId.duckdb) {
            return this.duckdbDataSourceService.getDataSource(workspaceId);
        }
        if (dataSourceId === DataSourceId.dune) {
            return this.duneDataSourceService.getDataSource(workspaceId);
        }
        throw new ForbiddenException('Unknown datasource');
    }

    @Get(':dataSourceId/schema')
    async getSchema(
        @Param('workspaceId') workspaceId: string,
        @Param('dataSourceId') dataSourceId: string,
    ) {
        if (dataSourceId === DataSourceId.sandwormCloud) {
            return this.queryService.getSchema();
        }
        throw new ForbiddenException('Unknown datasource');
    }

    @Post(':dataSourceId/ping')
    async ping(
        @Param('workspaceId') workspaceId: string,
        @Param('dataSourceId') dataSourceId: string,
    ) {
        if (dataSourceId === DataSourceId.sandwormCloud) {
            return this.dataSourceService.ping();
        }
        if (dataSourceId === DataSourceId.duckdb) {
            return this.duckdbDataSourceService.ping();
        }
        if (dataSourceId === DataSourceId.dune) {
            return this.duneDataSourceService.ping();
        }
        throw new ForbiddenException('Unknown datasource');
    }
}