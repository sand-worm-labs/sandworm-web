import { Injectable } from '@nestjs/common';
import { DataSourceId, DataSourceName, DataSourceType } from '@sandworm/types';

@Injectable()
export class SandwormCloudDataSourceService {

    getDataSource(workspaceId: string) {
        return {
            type: DataSourceType.sandwormCloud,
            data: {
                id: DataSourceId.sandwormCloud,
                workspaceId: workspaceId,
                name: DataSourceName.sandwormCloud,
                // Disabled for now — SandwormCloudQueryService is still a
                // mock (fake schema, no real query execution wired up), so
                // this stays visible but unselectable until it's real.
                disabled: true,
                connStatus: 'offline',
                lastConnection: null,
                connError: { name: 'NotAvailable', message: 'Sandworm Cloud is not available yet' },
                isDefault: false,
                isDemo: false,
                createdAt: new Date(0).toISOString(),
                updatedAt: new Date().toISOString(),
            },
        };
    }

    // False until SandwormCloudQueryService runs real queries (see getDataSource
    // above). This is the one place to change when it does.
    async canRunSql(): Promise<boolean> {
        return false;
    }

    async ping() {
        if (await this.canRunSql()) {
            return { connStatus: 'online' as const, lastConnection: new Date() };
        }
        return {
            connStatus: 'offline' as const,
            connError: { name: 'NotAvailable', message: 'Sandworm Cloud is not available yet' },
        };
    }
}