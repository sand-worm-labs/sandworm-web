import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from '@briefer/database';
import { WriteBackResult } from '@sandworm/types';
import { PythonExecutorService } from '../python-executor.service';
import { BigQueryWritebackAdapter } from './adapters/bigquery.adapter';
import { PostgresWritebackAdapter } from './adapters/postgres.adapter';

export type Writeback = {
    promise: Promise<WriteBackResult>;
    abort: () => Promise<void>;
};

export const WRITEBACK_ENABLED_DATASOURCE_TYPES = new Set<DataSource['type']>([
    'psql',
    'redshift',
    'bigquery',
]);

@Injectable()
export class WritebackService {
    private readonly logger = new Logger(WritebackService.name);

    constructor(
        private readonly pythonExecutor: PythonExecutorService,
        private readonly config: ConfigService,
        private readonly bigQueryHandler: BigQueryWritebackAdapter,
        private readonly postgresHandler: PostgresWritebackAdapter,
    ) { }

    async writeback(
        workspaceId: string,
        sessionId: string,
        dataframeName: string,
        datasource: DataSource,
        tableName: string,
        overwriteTable: boolean,
        onConflict: 'update' | 'ignore',
        onConflictColumns: string[],
    ): Promise<Writeback> {
        const encryptionKey = this.config.get<string>('ENVIRONMENT_VARIABLES_ENCRYPTION_KEY');

        switch (datasource.type) {
            case 'psql':
            case 'redshift':
                return this.postgresHandler.writeback(
                    workspaceId,
                    sessionId,
                    dataframeName,
                    datasource,
                    tableName,
                    overwriteTable,
                    onConflict,
                    encryptionKey,
                );

            case 'bigquery':
                return this.bigQueryHandler.writeback(
                    workspaceId,
                    sessionId,
                    dataframeName,
                    datasource.data,
                    tableName,
                    overwriteTable,
                    onConflict,
                    onConflictColumns,
                    encryptionKey,
                );

            case 'sqlserver':
            case 'mysql':
            case 'oracle':
            case 'athena':
            case 'snowflake':
            case 'trino':
            case 'databrickssql':
                throw new Error(`${datasource.type} writeback not implemented`);

            default:
                throw new Error(`Unsupported datasource type: ${datasource.type}`);
        }
    }

    isWritebackEnabled(datasourceType: DataSource['type']): boolean {
        return WRITEBACK_ENABLED_DATASOURCE_TYPES.has(datasourceType);
    }
}