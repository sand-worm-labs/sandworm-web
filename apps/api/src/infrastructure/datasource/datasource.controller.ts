import {
    Controller,
    Get,
    Post,
    Param,
    ForbiddenException,
} from '@nestjs/common';
import { DataSourceId, DataSourceName } from '@sandworm/types';
import { SandwormCloudDataSourceService } from './sandworm-cloud/sandworm-cloud-datasource.service';
import { SandwormCloudQueryService } from './sandworm-cloud/sandworm-cloud-query.service';
import { DuckDBDataSourceService } from './duck-db/duckdb-datasource.service';
import { DuneDataSourceService } from './dune/dune-datasource.service';
import { ChainSqlService } from './chain-sql.service';
import { PAID_PLAN_ERROR, PaidPlanService, paidPlanMessage } from '@/features/code-execution/query-engine/paid-plan.service';

type Source = { type: string; data: Record<string, unknown> };

const planError = (name: unknown) => ({ name: PAID_PLAN_ERROR, message: paidPlanMessage(String(name)) });

// How Dune and Sandworm Cloud are shown to a free workspace: there, but off.
const locked = (source: Source): Source => ({
    ...source,
    data: { ...source.data, disabled: true, connStatus: 'offline', connError: planError(source.data.name) },
});

@Controller('v1/workspaces/:workspaceId/data-sources')
export class DataSourcesController {
    constructor(
        private readonly queryService: SandwormCloudQueryService,
        private readonly dataSourceService: SandwormCloudDataSourceService,
        private readonly duckdbDataSourceService: DuckDBDataSourceService,
        private readonly duneDataSourceService: DuneDataSourceService,
        private readonly chainSqlService: ChainSqlService,
        private readonly paidPlanService: PaidPlanService,
    ) {}

    @Get()
    async listDataSources(@Param('workspaceId') workspaceId: string) {
        const paid = await this.paidPlanService.isPaid(workspaceId);
        const chain = (source: Source) => (paid ? source : locked(source));
        return [
            this.duckdbDataSourceService.getDataSource(workspaceId),
            chain(this.dataSourceService.getDataSource(workspaceId)),
            chain(this.duneDataSourceService.getDataSource(workspaceId)),
        ];
    }

    // Declared before :dataSourceId so it is not read as an id.
    @Get('chain-sql')
    async chainSql(@Param('workspaceId') workspaceId: string) {
        return this.chainSqlService.status(workspaceId);
    }

    @Get(':dataSourceId')
    async getDataSource(
        @Param('workspaceId') workspaceId: string,
        @Param('dataSourceId') dataSourceId: string,
    ) {
        if (dataSourceId === DataSourceId.duckdb) {
            return this.duckdbDataSourceService.getDataSource(workspaceId);
        }
        const source = this.chainSource(workspaceId, dataSourceId);
        return (await this.paidPlanService.isPaid(workspaceId)) ? source : locked(source);
    }

    @Get(':dataSourceId/schema')
    async getSchema(
        @Param('workspaceId') workspaceId: string,
        @Param('dataSourceId') dataSourceId: string,
    ) {
        if (dataSourceId === DataSourceId.sandwormCloud) {
            await this.requirePaidPlan(workspaceId, DataSourceName.sandwormCloud);
            return this.queryService.getSchema();
        }
        throw new ForbiddenException('Unknown datasource');
    }

    @Post(':dataSourceId/ping')
    async ping(
        @Param('workspaceId') workspaceId: string,
        @Param('dataSourceId') dataSourceId: string,
    ) {
        if (dataSourceId === DataSourceId.duckdb) {
            return this.duckdbDataSourceService.ping();
        }
        const source = this.chainSource(workspaceId, dataSourceId);
        if (!(await this.paidPlanService.isPaid(workspaceId))) {
            return { connStatus: 'offline' as const, connError: planError(source.data.name) };
        }
        return dataSourceId === DataSourceId.dune ? this.duneDataSourceService.ping() : this.dataSourceService.ping();
    }

    private chainSource(workspaceId: string, dataSourceId: string): Source {
        if (dataSourceId === DataSourceId.sandwormCloud) return this.dataSourceService.getDataSource(workspaceId);
        if (dataSourceId === DataSourceId.dune) return this.duneDataSourceService.getDataSource(workspaceId);
        throw new ForbiddenException('Unknown datasource');
    }

    private async requirePaidPlan(workspaceId: string, source: string): Promise<void> {
        if (!(await this.paidPlanService.isPaid(workspaceId))) throw new ForbiddenException(paidPlanMessage(source));
    }
}
