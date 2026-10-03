import { Injectable } from '@nestjs/common';
import { DataSourceId, DataSourceName, DataSourceType } from '@sandworm/types';
import { SandwormCloudQueryService } from './sandworm-cloud-query.service';

const CAN_RUN_SQL_TIMEOUT_MS = 1500;

@Injectable()
export class SandwormCloudDataSourceService {
    constructor(private readonly queryService: SandwormCloudQueryService) { }

    getDataSource(workspaceId: string) {
        const configured = this.queryService.isConfigured;
        return {
            type: DataSourceType.sandwormCloud,
            data: {
                id: DataSourceId.sandwormCloud,
                workspaceId: workspaceId,
                name: DataSourceName.sandwormCloud,
                disabled: !configured,
                connStatus: configured ? 'online' : 'offline',
                lastConnection: null,
                connError: configured ? null : { name: 'NotAvailable', message: 'Sandworm Cloud is not configured' },
                isDefault: false,
                isDemo: false,
                createdAt: new Date(0).toISOString(),
                updatedAt: new Date().toISOString(),
            },
        };
    }

    async ping() {
        try {
            await this.queryService.ping();
            return {
                connStatus: 'online' as const,
                lastConnection: new Date(),
            };
        } catch (error) {
            return {
                connStatus: 'offline' as const,
                connError: {
                    name: 'ConnectionError',
                    message: error instanceof Error ? error.message : 'Could not connect to Sandworm Cloud',
                },
            };
        }
    }

    // Configured and answering within a moment; a slow or dead database counts
    // as unavailable.
    async canRunSql(): Promise<boolean> {
        if (!this.queryService.isConfigured) return false;
        const slow = new Promise<false>(resolve => setTimeout(() => resolve(false), CAN_RUN_SQL_TIMEOUT_MS).unref());
        return Promise.race([this.ping().then(result => result.connStatus === 'online'), slow]);
    }
}
