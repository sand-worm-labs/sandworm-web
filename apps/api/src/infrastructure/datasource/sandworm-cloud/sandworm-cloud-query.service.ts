import { Injectable, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SandwormCloudQueryService {
    constructor(private configService: ConfigService) {
        // TODO: Initialize your actual data source client here
        // For now, just a placeholder
    }

    async executeQuery(query: string, userId: string, workspaceId: string) {
        // Validate query
        this.validateQuery(query);

        // Add row limit
        const limitedQuery = this.addRowLimit(query, 10000);

        // TODO: Implement actual query execution
        // For now, return mock data
        return {
            columns: ['id', 'name', 'value'],
            rows: [
                [1, 'Example', 100],
                [2, 'Test', 200],
            ],
        };
    }

    async getSchema() {
        // TODO: Implement actual schema fetching
        // For now, return mock schema
        const tables = new Map();

        const mainSchema = new Map();

        mainSchema.set('example_table', {
            columns: [
                { name: 'id', type: 'bigint' },
                { name: 'name', type: 'varchar' },
                { name: 'value', type: 'decimal' },
                { name: 'created_at', type: 'timestamp' },
            ],
        });

        mainSchema.set('another_table', {
            columns: [
                { name: 'id', type: 'bigint' },
                { name: 'description', type: 'varchar' },
            ],
        });

        tables.set('main', mainSchema);

        return {
            tables,
            defaultSchema: 'main',
        };
    }

    private validateQuery(query: string) {
        const forbidden = [
            'DROP',
            'DELETE',
            'UPDATE',
            'INSERT',
            'ALTER',
            'TRUNCATE',
            'CREATE',
        ];
        const upper = query.toUpperCase();

        for (const keyword of forbidden) {
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