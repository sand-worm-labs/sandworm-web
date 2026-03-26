import { Injectable } from '@nestjs/common';

@Injectable()
export class DuckDBDataSourceService {
    constructor() {}

    getDataSource(workspaceId: string) {
        return {
            type: 'duckdb',
            data: {
                id: 'duckdb',
                workspaceId,
                name: 'DuckDB',
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