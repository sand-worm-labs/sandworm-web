import { Injectable } from '@nestjs/common';
import { DuckDBQueryService } from './duckdb/duckdb-query.service';
import { TrinoQueryService } from './trino/trino-query.service';
import { PostgresQueryService } from './postgres/postgres-query.service';
import { PAID_PLAN_ERROR, PaidPlanService, paidPlanMessage, proPlanMessage } from './paid-plan.service';
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
        // Both are written into the generated Python as-is, so a crafted
        // notebook could otherwise smuggle in code of its own.
        if (!isPythonIdentifier(dataframeName) || !isSafeQueryId(queryId)) {
            return [
                Promise.resolve({
                    type: 'python-error',
                    ename: 'InvalidName',
                    evalue: `"${dataframeName}" is not a valid dataframe name: use letters, numbers and underscores, not starting with a number`,
                    traceback: [],
                }),
                async () => {},
            ];
        }
        knownDataframes = knownDataframes.filter(d => isPythonIdentifier(d.name) && isSafeQueryId(d.queryId));

        // Dune (trino) needs Pro or Enterprise, Sandworm Cloud (postgres) any
        // paid plan. Not a syntax-error: the AI would then try to fix the query.
        if (datasource !== 'duckdb') {
            const isDune = datasource === 'trino';
            const allowed = isDune
                ? await this.paidPlanService.canUseDune(workspaceId)
                : await this.paidPlanService.isPaid(workspaceId);
            if (!allowed) {
                const evalue = isDune ? proPlanMessage('Dune') : paidPlanMessage('Sandworm Cloud');
                return [
                    Promise.resolve({ type: 'python-error', ename: PAID_PLAN_ERROR, evalue, traceback: [] }),
                    async () => {},
                ];
            }
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

const PYTHON_IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]{0,254}$/;
const PYTHON_KEYWORDS = new Set([
    'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue',
    'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in',
    'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield',
]);

export function isPythonIdentifier(name: string): boolean {
    return PYTHON_IDENTIFIER.test(name) && !PYTHON_KEYWORDS.has(name);
}

// Block ids are UUIDs; also used in file paths, so no dots or slashes.
export function isSafeQueryId(id: string): boolean {
    return /^[A-Za-z0-9_-]{1,128}$/.test(id);
}
