import {
    Controller,
    Get,
    Post,
    Param,
    Body,
    Request,
    ForbiddenException,
} from '@nestjs/common';
import { SandwormCloudDataSourceService } from './sandworm-cloud/sandworm-cloud-datasource.service';
import { SandwormCloudQueryService } from './sandworm-cloud/sandworm-cloud-query.service';

@Controller('v1/workspaces/:workspaceId/data-sources')
export class DataSourcesController {
    constructor(
        private readonly queryService: SandwormCloudQueryService,
        private readonly dataSourceService: SandwormCloudDataSourceService,
    ) { }

    @Get()
    async listDataSources(@Param('workspaceId') workspaceId: string) {
        return [this.dataSourceService.getDataSource(workspaceId)];
    }

    @Get(':dataSourceId')
    async getDataSource(
        @Param('workspaceId') workspaceId: string,
        @Param('dataSourceId') dataSourceId: string,
    ) {
        if (dataSourceId === 'sandwormcloud-datasource') {
            return this.dataSourceService.getDataSource(workspaceId);
        }
        throw new ForbiddenException('Only SandwormCloud datasource is available');
    }

    @Get(':dataSourceId/schema')
    async getSchema(
        @Param('workspaceId') workspaceId: string,
        @Param('dataSourceId') dataSourceId: string,
    ) {
        if (dataSourceId === 'sandwormcloud-datasource') {
            return this.queryService.getSchema();
        }
        throw new ForbiddenException('Only SandwormCloud datasource is available');
    }

    @Post(':dataSourceId/ping')
    async ping(
        @Param('workspaceId') workspaceId: string,
        @Param('dataSourceId') dataSourceId: string,
    ) {
        if (dataSourceId === 'sandwormcloud-datasource') {
            return this.dataSourceService.ping();
        }
        throw new ForbiddenException('Only SandwormCloud datasource is available');
    }

}