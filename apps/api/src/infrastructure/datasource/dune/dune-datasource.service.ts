import { connect } from 'node:net';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSourceId, DataSourceName, DataSourceType } from '@sandworm/types';
import { AllConfigType } from '@/core/config/config.type';
import { AdhocQueryResult, TrinoQueryService } from '@/features/code-execution/query-engine/trino/trino-query.service';

const FORBIDDEN_KEYWORDS = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'TRUNCATE', 'CREATE'];
const REACH_TIMEOUT_MS = 1500;
const REACH_CACHE_MS = 30_000;

@Injectable()
export class DuneDataSourceService {
    constructor(
        private readonly configService: ConfigService<AllConfigType>,
        private readonly trinoQueryService: TrinoQueryService,
    ) { }

    private reach?: { at: number; ok: Promise<boolean> };

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

        if (!(await this.canRunSql())) {
            const { host, port } = this.configService.getOrThrow('trino', { infer: true });
            return {
                connStatus: 'offline' as const,
                connError: { name: 'Unreachable', message: `Cannot connect to ${host}:${port}` },
            };
        }

        // The endpoint accepts connections; only running a query proves more.
        return {
            connStatus: 'online' as const,
            lastConnection: new Date(),
        };
    }

    // Whether chain SQL can run at all: configured, and the Trino endpoint
    // accepts a connection. Cached briefly, since every AI turn asks.
    canRunSql(): Promise<boolean> {
        if (!this.isConfigured()) return Promise.resolve(false);
        if (!this.reach || Date.now() - this.reach.at > REACH_CACHE_MS) {
            this.reach = { at: Date.now(), ok: this.isReachable() };
        }
        return this.reach.ok;
    }

    private isReachable(): Promise<boolean> {
        const { host, port } = this.configService.getOrThrow('trino', { infer: true });
        return new Promise(resolve => {
            const socket = connect({ host, port });
            const done = (ok: boolean) => {
                socket.destroy();
                resolve(ok);
            };
            socket.setTimeout(REACH_TIMEOUT_MS, () => done(false));
            socket.once('connect', () => done(true));
            socket.once('error', () => done(false));
        });
    }

    // Ad-hoc execution (schema browser "test query", API callers, etc.) —
    // not tied to a notebook block, so it gets its own guardrail: no
    // mutating statements. No row cap or timeout.
    async executeQuery(query: string, userId: string, workspaceId: string): Promise<AdhocQueryResult> {
        this.validateQuery(query);
        return this.trinoQueryService.executeQuery(query);
    }

    private validateQuery(query: string): void {
        const upper = query.toUpperCase();
        for (const keyword of FORBIDDEN_KEYWORDS) {
            if (upper.includes(keyword)) {
                throw new ForbiddenException(`${keyword} statements not allowed`);
            }
        }
    }
}
