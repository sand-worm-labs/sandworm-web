import { ForbiddenException, Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

// Sandworm Cloud is a separate, plain Postgres database from the app's own,
// configured with SANDWORM_CLOUD_DB_{HOST,PORT,NAME,USER,PASSWORD} (SSL on
// unless SANDWORM_CLOUD_DB_SSL=false). SQL blocks run against it through
// PostgresQueryService; this service only handles ping and schema browsing.
@Injectable()
export class SandwormCloudQueryService implements OnModuleDestroy {
    private connection?: DataSource;

    constructor(private configService: ConfigService) { }

    get isConfigured(): boolean {
        return !!this.configService.get('SANDWORM_CLOUD_DB_HOST');
    }

    private async getConnection(): Promise<DataSource> {
        if (!this.isConfigured) {
            throw new ForbiddenException('Sandworm Cloud is not configured');
        }
        this.connection ??= new DataSource({
            type: 'postgres',
            host: this.configService.get('SANDWORM_CLOUD_DB_HOST'),
            port: Number(this.configService.get('SANDWORM_CLOUD_DB_PORT') ?? 5432),
            database: this.configService.get('SANDWORM_CLOUD_DB_NAME') ?? 'postgres',
            username: this.configService.get('SANDWORM_CLOUD_DB_USER') ?? 'postgres',
            password: this.configService.get('SANDWORM_CLOUD_DB_PASSWORD'),
            ssl: this.configService.get('SANDWORM_CLOUD_DB_SSL') === 'false' ? false : { rejectUnauthorized: false },
            extra: { max: 5 },
        });
        if (!this.connection.isInitialized) await this.connection.initialize();
        return this.connection;
    }

    async onModuleDestroy() {
        if (this.connection?.isInitialized) await this.connection.destroy();
    }

    async ping(): Promise<void> {
        await (await this.getConnection()).query('SELECT 1');
    }

    async getSchema() {
        const rows: { table_schema: string; table_name: string; column_name: string; data_type: string }[] =
            await (await this.getConnection()).query(
                `SELECT table_schema, table_name, column_name, data_type
                 FROM information_schema.columns
                 WHERE table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
                 ORDER BY table_schema, table_name, ordinal_position`,
            );

        const tables: Record<string, Record<string, { columns: { name: string; type: string }[] }>> = {};
        for (const r of rows) {
            ((tables[r.table_schema] ??= {})[r.table_name] ??= { columns: [] }).columns.push({
                name: r.column_name,
                type: r.data_type,
            });
        }
        return { tables, defaultSchema: 'public' };
    }
}
