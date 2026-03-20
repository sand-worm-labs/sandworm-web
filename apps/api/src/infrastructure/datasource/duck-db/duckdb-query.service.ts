import { Injectable } from '@nestjs/common';
import { DuckDBService } from './duckdb.service';

@Injectable()
export class DuckDBQueryService {
    constructor(private readonly duckdbService: DuckDBService) {}

    async executeQuery(query: string) {
        const limited = this.addRowLimit(query, 10000);
        const rows = await this.duckdbService.query(limited);
        const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
        return {
            columns,
            rows: rows.map((r) => columns.map((c) => r[c])),
        };
    }

    async getSchema() {
        const tables = await this.duckdbService.query(`
            SELECT table_schema, table_name, column_name, data_type
            FROM information_schema.columns
            ORDER BY table_schema, table_name, ordinal_position
        `);

        const schemaMap = new Map<string, Map<string, any>>();
        for (const row of tables) {
            if (!schemaMap.has(row.table_schema)) {
                schemaMap.set(row.table_schema, new Map());
            }
            const schema = schemaMap.get(row.table_schema)!;
            if (!schema.has(row.table_name)) {
                schema.set(row.table_name, { columns: [] });
            }
            schema.get(row.table_name).columns.push({
                name: row.column_name,
                type: row.data_type,
            });
        }

        return { tables: schemaMap, defaultSchema: 'main' };
    }

    private addRowLimit(query: string, maxRows: number): string {
        if (!query.toUpperCase().includes('LIMIT')) {
            return `${query.trim().replace(/;$/, '')} LIMIT ${maxRows}`;
        }
        return query;
    }
}
