// apps/api/src/code-executor/writeback/handlers/postgres.handler.ts

import { Injectable, Logger } from '@nestjs/common';
import { DataSource, getDatabaseURL } from '@sandworm/database';
import { WriteBackResult, jsonString } from '@sandworm/types';
import { PythonExecutorService } from '../../python-executor.service';
import { Writeback } from '../writeback.service';

@Injectable()
export class PostgresWritebackAdapter {
    private readonly logger = new Logger(PostgresWritebackAdapter.name);

    constructor(private readonly pythonExecutor: PythonExecutorService) { }

    async writeback(
        workspaceId: string,
        sessionId: string,
        dataframeName: string,
        datasource: DataSource,
        tableName: string,
        overwriteTable: boolean,
        onConflict: 'update' | 'ignore',
        encryptionKey: string,
    ): Promise<Writeback> {
        const executedAt = new Date().toISOString();

        // Get database URL
        const databaseUrl = await getDatabaseURL(datasource, encryptionKey);

        // Render table name
        const table = await this.pythonExecutor.renderJinja(workspaceId, sessionId, tableName);
        if (typeof table !== 'string') {
            return {
                promise: Promise.resolve({
                    _tag: 'error',
                    executedAt,
                    step: 'validation',
                    reason: 'invalid-table-template',
                    pythonError: table,
                }),
                abort: async () => { },
            };
        }

        // Build code
        const code = this.buildWritebackCode(dataframeName, table, overwriteTable, onConflict, databaseUrl);

        // Execute
        let result: WriteBackResult | null = null;
        const { promise, abort } = await this.pythonExecutor.executeCode(
            workspaceId,
            sessionId,
            code,
            (outputs) => {
                result = this.parseOutputs(outputs, executedAt, datasource.data.id, result, {
                    dataframeName,
                    tableName: table,
                    overwriteTable,
                    onConflict,
                });
            },
            { storeHistory: false },
        );

        return {
            promise: promise.then(() => {
                if (!result) {
                    this.logger.error(
                        { workspaceId, sessionId, dataframeName, tableName, overwriteTable, onConflict },
                        'No writeback result',
                    );
                    return { _tag: 'error', executedAt, step: 'unknown' } as WriteBackResult;
                }
                return result;
            }),
            abort,
        };
    }

    private parseOutputs(
        outputs: any[],
        executedAt: string,
        dataSourceId: string,
        currentResult: WriteBackResult | null,
        metadata: any,
    ): WriteBackResult | null {
        let result = currentResult;

        for (const output of outputs) {
            if (result && result._tag === 'success') {
                continue;
            }

            switch (output.type) {
                case 'error':
                    result = { _tag: 'error', executedAt, step: 'unknown' } as WriteBackResult;
                    this.logger.error({ ...metadata, error: output }, 'Python error during writeback');
                    break;

                case 'stdio':
                    if (output.name === 'stderr') {
                        result = { _tag: 'error', executedAt, step: 'unknown' } as WriteBackResult;
                    } else if (output.name === 'stdout') {
                        const lines = output.text.split('\n');
                        for (const line of lines) {
                            const trimmed = line.trim();
                            if (!trimmed) continue;

                            const parsed = jsonString.pipe(WriteBackResult).safeParse(trimmed);
                            if (parsed.success) {
                                result =
                                    parsed.data._tag === 'success'
                                        ? { ...parsed.data, dataSourceId }
                                        : parsed.data;
                            } else {
                                this.logger.error(
                                    { ...metadata, output: output.text, error: parsed.error },
                                    'Failed to parse writeback result',
                                );
                                result = { _tag: 'error', executedAt, step: 'unknown' } as WriteBackResult;
                            }
                        }
                    }
                    break;
            }
        }

        return result;
    }

    private buildWritebackCode(
        dataframeName: string,
        tableName: string,
        overwriteTable: boolean,
        onConflict: 'update' | 'ignore',
        databaseUrl: string,
    ): string {
        return `
def _sandworm_writeback(df, table_name, overwrite_table, on_conflict):
    import json, datetime, random, string
    from sqlalchemy import create_engine, inspect, text
    from sqlalchemy.exc import DatabaseError

    step = "schema-inspection"
    executed_at = datetime.datetime.now().isoformat()

    try:
        engine = create_engine(${JSON.stringify(databaseUrl)})
        inspector = inspect(engine)

        # Table doesn't exist - simple insert
        if table_name not in inspector.get_table_names():
            step = "insert"
            inserted_rows = df.to_sql(table_name, engine, if_exists='fail', index=False)
            print(json.dumps({
                "_tag": "success",
                "dataSourceId": "placeholder",
                "tableName": table_name,
                "overwritten": overwrite_table,
                "insertedRows": inserted_rows,
                "updatedRows": 0,
                "ignoredRows": 0,
                "executedAt": executed_at
            }))
            return

        step = "cleanup"

        # Overwrite mode
        if overwrite_table:
            if len(df) == 0:
                print(json.dumps({
                    "_tag": "error",
                    "reason": "overwrite-empty-dataframe",
                    "executedAt": executed_at
                }))
                return

            with engine.connect() as connection:
                tx = connection.begin()
                try:
                    connection.execute(text(f"DELETE FROM {table_name}"))
                    step = "insert"
                    inserted_rows = df.to_sql(table_name, connection, if_exists='append', index=False)
                    tx.commit()
                    print(json.dumps({
                        "_tag": "success",
                        "dataSourceId": "placeholder",
                        "tableName": table_name,
                        "overwritten": overwrite_table,
                        "insertedRows": inserted_rows,
                        "updatedRows": 0,
                        "ignoredRows": 0,
                        "executedAt": executed_at
                    }))
                    return
                except Exception as e:
                    tx.rollback()
                    raise e

        # Empty dataframe
        if len(df) == 0:
            print(json.dumps({
                "_tag": "success",
                "dataSourceId": "placeholder",
                "tableName": table_name,
                "overwritten": overwrite_table,
                "insertedRows": 0,
                "updatedRows": 0,
                "ignoredRows": 0,
                "executedAt": executed_at
            }))
            return

        # Upsert mode
        step = "insert"
        with engine.connect() as connection:
            tx = connection.begin()
            try:
                random_part = ''.join(random.choices(string.ascii_letters + string.digits, k=10))
                temp_table_name = f"sandworm_temp_{table_name}_{random_part}"
                df.to_sql(temp_table_name, connection, if_exists='replace', index=False)

                df_columns = df.columns.tolist()
                
                if on_conflict == "ignore":
                    insert_stmt = text(f'''
                        WITH ins AS (
                            INSERT INTO {table_name} ({", ".join(df_columns)})
                            SELECT {", ".join(df_columns)} FROM {temp_table_name}
                            ON CONFLICT DO NOTHING
                            RETURNING 1
                        )
                        SELECT COUNT(*) FROM ins
                    ''')
                    result_row = connection.execute(insert_stmt).fetchone()
                    inserted_rows = result_row[0]
                    updated_rows = 0
                else:
                    # Get primary keys and unique constraints
                    primary_keys = inspector.get_pk_constraint(table_name)['constrained_columns']
                    uniques = [u['column_names'] for u in inspector.get_unique_constraints(table_name)]
                    conflict_columns = list(primary_keys) + [col for u in uniques for col in u]

                    if conflict_columns:
                        update_set = ", ".join([f"{col} = EXCLUDED.{col}" for col in df_columns])
                        insert_stmt = text(f'''
                            WITH ins AS (
                                INSERT INTO {table_name} ({", ".join(df_columns)})
                                SELECT {", ".join(df_columns)} FROM {temp_table_name}
                                ON CONFLICT ({", ".join(conflict_columns)})
                                DO UPDATE SET {update_set}
                                RETURNING *, (xmax = 0) AS is_insert
                            )
                            SELECT COUNT(*) FILTER (WHERE is_insert) AS inserted_rows,
                                   COUNT(*) FILTER (WHERE NOT is_insert) AS updated_rows
                            FROM ins
                        ''')
                        result_row = connection.execute(insert_stmt).fetchone()
                        inserted_rows = result_row[0]
                        updated_rows = result_row[1]
                    else:
                        insert_stmt = text(f'''
                            WITH ins AS (
                                INSERT INTO {table_name} ({", ".join(df_columns)})
                                SELECT {", ".join(df_columns)} FROM {temp_table_name}
                                RETURNING 1
                            )
                            SELECT COUNT(*) FROM ins
                        ''')
                        result_row = connection.execute(insert_stmt).fetchone()
                        inserted_rows = result_row[0]
                        updated_rows = 0

                ignored_rows = len(df) - inserted_rows - updated_rows

                # Drop temp table
                connection.execute(text(f"DROP TABLE IF EXISTS {temp_table_name}"))

                tx.commit()
                print(json.dumps({
                    "_tag": "success",
                    "dataSourceId": "placeholder",
                    "tableName": table_name,
                    "overwritten": overwrite_table,
                    "insertedRows": inserted_rows,
                    "updatedRows": updated_rows,
                    "ignoredRows": ignored_rows,
                    "executedAt": executed_at
                }))
            except Exception as e:
                tx.rollback()
                raise e
    except DatabaseError as e:
        print(json.dumps({
            "_tag": "error",
            "executedAt": executed_at,
            "step": step,
            "message": str(e)
        }))

if "${dataframeName}" in globals():
    _sandworm_writeback(
        ${dataframeName},
        "${tableName}",
        ${overwriteTable ? 'True' : 'False'},
        "${onConflict}"
    )
else:
    print(json.dumps({
        "_tag": "error",
        "step": "validation",
        "reason": "dataframe-not-found",
        "executedAt": datetime.datetime.now().isoformat()
    }))
        `;
    }
}