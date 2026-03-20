import { Injectable } from '@nestjs/common';
import { DuckDBService } from './duckdb.service';

@Injectable()
export class DuckDBDataSourceService {
    constructor(private readonly duckdbService: DuckDBService) {}

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
        try {
            await this.duckdbService.query('SELECT 1');
            return { connStatus: 'online' as const, lastConnection: new Date() };
        } catch (error) {
            return {
                connStatus: 'offline' as const,
                connError: { name: 'ConnectionError', message: String(error) },
            };
        }
    }
}