import { Injectable } from '@nestjs/common';
import { DataSourceId, DataSourceName, DataSourceType } from '@sandworm/types';

@Injectable()
export class DuckDBDataSourceService {
    constructor() {}

    getDataSource(workspaceId: string) {
        return {
            type: DataSourceType.duckdb,
            data: {
                id: DataSourceId.duckdb,
                workspaceId,
                name: DataSourceName.duckdb,
                connStatus: 'online',
                lastConnection: new Date().toISOString(),
                connError: null,
                isDefault: true,
                isDemo: false,
                path: ':memory:',
                notes: '',
                readOnly: true,
                createdAt: new Date(0).toISOString(),
                updatedAt: new Date().toISOString(),
                
            },
        };
    }

    async ping() {
     true 
    }
}