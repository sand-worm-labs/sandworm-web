import { Injectable } from '@nestjs/common';
import { DuckDBQueryService } from './duckdb/duckdb-query.service';
import { TrinoQueryService } from './trino/trino-query.service';
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
    ) { }

    async makeSQLQuery(
        workspaceId: string,
        sessionId: string,
        queryId: string,
        dataframeName: string,
        datasource: 'duckdb' | 'trino',
        sql: string,
        resultOptions: { pageSize: number; dashboardPageSize: number },
        onProgress: (result: SuccessRunQueryResult) => void,
        configuration: SQLQueryConfiguration | null,
    ): Promise<[Promise<RunQueryResult>, () => Promise<void>]> {
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
        );
    }
}
