import { Injectable } from '@nestjs/common';
import { DuckDBQueryService } from './duckdb/duckdb-query.service';
import {
    RunQueryResult,
    SuccessRunQueryResult,
    SQLQueryConfiguration,
} from '@sandworm/types';

@Injectable()
export class QueryExecutionService {
    constructor(
        private readonly duckdbQueryService: DuckDBQueryService,
    ) { }

    async makeSQLQuery(
        workspaceId: string,
        sessionId: string,
        queryId: string,
        dataframeName: string,
        datasource: 'duckdb',
        sql: string,
        resultOptions: { pageSize: number; dashboardPageSize: number },
        onProgress: (result: SuccessRunQueryResult) => void,
        configuration: SQLQueryConfiguration | null,
    ): Promise<[Promise<RunQueryResult>, () => Promise<void>]> {
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
