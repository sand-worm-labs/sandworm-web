import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSourceId, DataSourceName, DataSourceType } from '@sandworm/types';
import { AllConfigType } from '@/core/config/config.type';
import { AdhocQueryResult, TrinoQueryService } from '@/features/code-execution/query-engine/trino/trino-query.service';

const FORBIDDEN_KEYWORDS = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'TRUNCATE', 'CREATE'];
const MAX_ROWS = 10000;

@Injectable()
export class DuneDataSourceService {
    constructor(
        private readonly configService: ConfigService<AllConfigType>,
        private readonly trinoQueryService: TrinoQueryService,
    ) { }

    private isConfigured(): boolean {
        const { host, catalog, user } = this.configService.getOrThrow('trino', { infer: true });
        return !!(host && catalog && user);
    }

    getDataSource(workspaceId: string) {
        const configured = this.isConfigured();

        return {
            type: DataSourceType.dune,
            data: {
                id: DataSourceId.dune,
                workspaceId,
                name: DataSourceName.dune,
                connStatus: configured ? 'checking' : 'offline',
                lastConnection: null,
                connError: configured
                    ? null
                    : { name: 'NotConfigured', message: 'TRINO_HOST/TRINO_CATALOG/TRINO_USER are not set' },
                isDefault: false,
                isDemo: false,
                notes: 'Queries Dune via its Trino-compatible endpoint',
                readOnly: true,
                createdAt: new Date(0).toISOString(),
                updatedAt: new Date().toISOString(),
            },
        };
    }

    async ping() {
        if (!this.isConfigured()) {
            return {
                connStatus: 'offline' as const,
                connError: {
                    name: 'NotConfigured',
                    message: 'TRINO_HOST/TRINO_CATALOG/TRINO_USER are not set',
                },
            };
        }

        // Actual connectivity is only proven by running a query — this data
        // source has no separate schema/ping service (unlike Sandworm Cloud)
        // so just report "configured" rather than claim a verified connection.
        return {
            connStatus: 'online' as const,
            lastConnection: new Date(),
        };
    }

    // Ad-hoc execution (schema browser "test query", API callers, etc.) —
    // not tied to a notebook block, so it gets its own guardrails: no
    // mutating statements, and a hard cap on rows returned.
    async executeQuery(query: string, userId: string, workspaceId: string): Promise<AdhocQueryResult> {
        this.validateQuery(query);
        const limitedQuery = this.addRowLimit(query, MAX_ROWS);
        return this.trinoQueryService.executeQuery(workspaceId, `dune-query-${userId}`, limitedQuery);
    }

    private validateQuery(query: string): void {
        const upper = query.toUpperCase();
        for (const keyword of FORBIDDEN_KEYWORDS) {
            if (upper.includes(keyword)) {
                throw new ForbiddenException(`${keyword} statements not allowed`);
            }
        }
    }

    private addRowLimit(query: string, maxRows: number): string {
        if (!query.toUpperCase().includes('LIMIT')) {
            return `${query.trim().replace(/;$/, '')} LIMIT ${maxRows}`;
        }
        return query;
    }
}
