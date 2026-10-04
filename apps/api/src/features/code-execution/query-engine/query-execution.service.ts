import { Injectable } from '@nestjs/common';
import { DuckDBQueryService } from './duckdb/duckdb-query.service';
import { TrinoQueryService } from './trino/trino-query.service';
import { PostgresQueryService } from './postgres/postgres-query.service';
import { PAID_PLAN_ERROR, PaidPlanService, paidPlanMessage } from './paid-plan.service';
import {
    RunQueryResult,
    SuccessRunQueryResult,
    SQLQueryConfiguration,
} from '@sandworm/types';

@Injectable()
export class QueryExecutionService {
    constructor(
        private readonly duckdbQueryService: DuckDBQueryService,
        private readonly trinoQueryService: TrinoQueryService,
        private readonly postgresQueryService: PostgresQueryService,
        private readonly paidPlanService: PaidPlanService,
    ) { }

    async makeSQLQuery(
        workspaceId: string,
        sessionId: string,
        queryId: string,
        dataframeName: string,
        datasource: 'duckdb' | 'trino' | 'postgres',
        sql: string,
        resultOptions: { pageSize: number; dashboardPageSize: number },
        onProgress: (result: SuccessRunQueryResult) => void,
        configuration: SQLQueryConfiguration | null,
        knownDataframes: { name: string; queryId: string }[] = [],
    ): Promise<[Promise<RunQueryResult>, () => Promise<void>]> {
        // Dune (trino) and Sandworm Cloud (postgres) are for paid workspaces.
        // Not a syntax-error: the AI would then try to fix the query.
        if (datasource !== 'duckdb' && !(await this.paidPlanService.isPaid(workspaceId))) {
            const source = datasource === 'trino' ? 'Dune' : 'Sandworm Cloud';
            return [
                Promise.resolve({ type: 'python-error', ename: PAID_PLAN_ERROR, evalue: paidPlanMessage(source), traceback: [] }),
                async () => {},
            ];
        }

        if (datasource === 'trino') {
            return this.trinoQueryService.execute(
                workspaceId,
                sessionId,
                queryId,
                dataframeName,
                sql,
                resultOptions,
                onProgress,
            );
        }

        if (datasource === 'postgres') {
            return this.postgresQueryService.execute(
                workspaceId,
                sessionId,
                queryId,
                dataframeName,
                sql,
                resultOptions,
                onProgress,
            );
        }

        if (datasource !== 'duckdb') {
            throw new Error(`Unsupported datasource: ${datasource}`);
        }

        return this.duckdbQueryService.execute(
            workspaceId,
            sessionId,
            queryId,
            dataframeName,
            sql,
            resultOptions,
            onProgress,
            knownDataframes,
        );
    }
}
