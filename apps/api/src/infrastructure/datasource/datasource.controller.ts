import {
    Controller,
    Get,
    Post,
    Param,
    ForbiddenException,
} from '@nestjs/common';
import { SandwormCloudDataSourceService } from './sandworm-cloud/sandworm-cloud-datasource.service';
import { SandwormCloudQueryService } from './sandworm-cloud/sandworm-cloud-query.service';
import { DuckDBDataSourceService } from './duck-db/duckdb-datasource.service';

@Controller('v1/workspaces/:workspaceId/data-sources')
export class DataSourcesController {
    constructor(
        private readonly queryService: SandwormCloudQueryService,
        private readonly dataSourceService: SandwormCloudDataSourceService,
        private readonly duckdbDataSourceService: DuckDBDataSourceService,
    ) {}

    @Get()
    async listDataSources(@Param('workspaceId') workspaceId: string) {
        return [
            this.duckdbDataSourceService.getDataSource(workspaceId),
            this.dataSourceService.getDataSource(workspaceId),
            
        ];
    }

    @Get(':dataSourceId')
    async getDataSource(
        @Param('workspaceId') workspaceId: string,
        @Param('dataSourceId') dataSourceId: string,
    ) {
        if (dataSourceId === 'sandwormcloud-datasource') {
            return this.dataSourceService.getDataSource(workspaceId);
        }
        if (dataSourceId === 'duckdb-datasource') {
            return this.duckdbDataSourceService.getDataSource(workspaceId);
        }
        throw new ForbiddenException('Unknown datasource');
    }

    @Get(':dataSourceId/schema')
    async getSchema(
        @Param('workspaceId') workspaceId: string,
        @Param('dataSourceId') dataSourceId: string,
    ) {
        if (dataSourceId === 'sandwormcloud-datasource') {
            return this.queryService.getSchema();
        }
        throw new ForbiddenException('Unknown datasource');
    }

    @Post(':dataSourceId/ping')
    async ping(
        @Param('workspaceId') workspaceId: string,
        @Param('dataSourceId') dataSourceId: string,
    ) {
        if (dataSourceId === 'sandwormcloud-datasource') {
            return this.dataSourceService.ping();
        }
        if (dataSourceId === 'duckdb-datasource') {
            return this.duckdbDataSourceService.ping();
        }
        throw new ForbiddenException('Unknown datasource');
    }
}