// import { Injectable, Logger } from '@nestjs/common';
// import { BigQueryDataSource, getCredentials } from '@sandworm/database';
// import { WriteBackResult, jsonString } from '@sandworm/types';
// import { PythonExecutorService } from '../../python-executor.service';
// import { Writeback } from '../writeback.service';

// @Injectable()
// export class BigQueryWritebackAdapter {
//     private readonly logger = new Logger(BigQueryWritebackAdapter.name);

//     constructor(private readonly pythonExecutor: PythonExecutorService) { }

//     async writeback(
//         workspaceId: string,
//         sessionId: string,
//         dataframeName: string,
//         datasource: BigQueryDataSource,
//         tableName: string,
//         overwriteTable: boolean,
//         onConflict: 'update' | 'ignore',
//         onConflictColumns: string[],
//         encryptionKey: string,
//     ): Promise<Writeback> {
//         const executedAt = new Date().toISOString();

//         // Validate table name
//         const table = await this.renderTableName(workspaceId, sessionId, tableName);
//         if (typeof table !== 'string') {
//             return this.createErrorResult(executedAt, 'validation', 'invalid-table-template', table);
//         }

//         // Get credentials
//         const credentials = await getCredentials(datasource, encryptionKey);

//         // Generate Python code
//         const code = this.buildWritebackCode(
//             dataframeName,
//             table,
//             overwriteTable,
//             onConflict,
//             onConflictColumns,
//             credentials,
//         );

//         return this.executeWriteback(
//             workspaceId,
//             sessionId,
//             code,
//             executedAt,
//             datasource.id,
//             {
//                 dataframeName,
//                 tableName: table,
//                 overwriteTable,
//                 onConflict,
//             },
//         );
//     }

//     private async renderTableName(
//         workspaceId: string,
//         sessionId: string,
//         tableName: string,
//     ): Promise<string | any> {
//         return this.pythonExecutor.renderJinja(workspaceId, sessionId, tableName);
//     }

//     private createErrorResult(
//         executedAt: string,
//         step: string,
//         reason: string,
//         pythonError?: any,
//     ): Writeback {
//         return {
//             promise: Promise.resolve({
//                 _tag: 'error',
//                 executedAt,
//                 step,
//                 reason,
//                 pythonError,
//             } as WriteBackResult),
//             abort: async () => { },
//         };
//     }

//     private async executeWriteback(
//         workspaceId: string,
//         sessionId: string,
//         code: string,
//         executedAt: string,
//         dataSourceId: string,
//         metadata: {
//             dataframeName: string;
//             tableName: string;
//             overwriteTable: boolean;
//             onConflict: string;
//         },
//     ): Promise<Writeback> {
//         let result: WriteBackResult | null = null;

//         const { promise, abort } = await this.pythonExecutor.executeCode(
//             workspaceId,
//             sessionId,
//             code,
//             (outputs) => {
//                 result = this.parseOutputs(outputs, executedAt, dataSourceId, metadata, result);
//             },
//             { storeHistory: false },
//         );

//         return {
//             promise: promise.then(() => {
//                 if (!result) {
//                     this.logger.error(
//                         { workspaceId, sessionId, ...metadata },
//                         'No writeback result',
//                     );
//                     return {
//                         _tag: 'error',
//                         executedAt,
//                         step: 'unknown',
//                     } as WriteBackResult;
//                 }
//                 return result;
//             }),
//             abort,
//         };
//     }

//     private parseOutputs(
//         outputs: any[],
//         executedAt: string,
//         dataSourceId: string,
//         metadata: any,
//         currentResult: WriteBackResult | null,
//     ): WriteBackResult | null {
//         let result = currentResult;

//         for (const output of outputs) {
//             if (result && result._tag === 'success') {
//                 continue;
//             }

//             switch (output.type) {
//                 case 'error':
//                     result = {
//                         _tag: 'error',
//                         executedAt,
//                         step: 'unknown',
//                     } as WriteBackResult;
//                     this.logger.error({ ...metadata, error: output }, 'Python error during writeback');
//                     break;

//                 case 'stdio':
//                     if (output.name === 'stderr') {
//                         result = {
//                             _tag: 'error',
//                             executedAt,
//                             step: 'unknown',
//                         } as WriteBackResult;
//                         this.logger.error({ ...metadata, error: output.text }, 'Python stderr');
//                     } else if (output.name === 'stdout') {
//                         result = this.parseStdout(output.text, executedAt, dataSourceId, metadata);
//                     }
//                     break;
//             }
//         }

//         return result;
//     }

//     private parseStdout(
//         text: string,
//         executedAt: string,
//         dataSourceId: string,
//         metadata: any,
//     ): WriteBackResult | null {
//         const lines = text.split('\n');
//         let result: WriteBackResult | null = null;

//         for (const line of lines) {
//             const trimmed = line.trim();
//             if (!trimmed) continue;

//             const parsed = jsonString.pipe(WriteBackResult).safeParse(trimmed);

//             if (parsed.success) {
//                 result =
//                     parsed.data._tag === 'success'
//                         ? { ...parsed.data, dataSourceId }
//                         : parsed.data;
//             } else {
//                 this.logger.error(
//                     { ...metadata, output: text, error: parsed.error },
//                     'Failed to parse writeback result',
//                 );
//                 result = {
//                     _tag: 'error',
//                     executedAt,
//                     step: 'unknown',
//                 } as WriteBackResult;
//             }
//         }

//         return result;
//     }

//     private buildWritebackCode(
//         dataframeName: string,
//         tableName: string,
//         overwriteTable: boolean,
//         onConflict: 'update' | 'ignore',
//         onConflictColumns: string[],
//         credentials: any,
//     ): string {
//         return `
// def _sandworm_writeback(df, table_name, overwrite_table, on_conflict, on_conflict_columns):
//     from google.api_core.exceptions import BadRequest, Conflict, NotFound, PermissionDenied
//     from google.cloud import bigquery
//     from google.oauth2 import service_account
//     import json, datetime, random, string, os, tempfile

//     executed_at = datetime.datetime.now().isoformat()
//     step = "validation"
//     temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".parquet.gz")

//     try:
//         # Validate table name format
//         if "." not in table_name:
//             result = {
//                 "_tag": "error",
//                 "step": step,
//                 "reason": "invalid-table-name",
//                 "message": "Table name must be in format dataset.table",
//                 "executedAt": executed_at
//             }
//             print(json.dumps(result))
//             return

//         # Validate conflict columns
//         df_columns = df.columns.tolist()
//         if len(df) > 0:
//             invalid_columns = [col for col in on_conflict_columns if col not in df_columns]
//             if invalid_columns:
//                 result = {
//                     "_tag": "error",
//                     "step": step,
//                     "reason": "invalid-conflict-columns",
//                     "columns": invalid_columns,
//                     "executedAt": executed_at
//                 }
//                 print(json.dumps(result))
//                 return

//         step = "schema-inspection"

//         # Setup BigQuery client
//         credentials_info = json.loads(${JSON.stringify(JSON.stringify(credentials))})
//         credentials = service_account.Credentials.from_service_account_info(credentials_info)
//         project_id = credentials_info['project_id']
//         table_name = f"{project_id}.{table_name}"
//         client = bigquery.Client(credentials=credentials, project=project_id)

//         # Save dataframe to temp parquet
//         df.to_parquet(temp_file.name, compression='gzip', index=False, engine="fastparquet")

//         job_config = bigquery.LoadJobConfig()
//         job_config.source_format = bigquery.SourceFormat.PARQUET

//         # Check if table exists
//         table = None
//         try:
//             table = client.get_table(table_name)
//             job_config.schema = table.schema
//         except NotFound:
//             job_config.autodetect = True

//         # Execute writeback based on mode
//         if not table:
//             _writeback_new_table(client, table_name, temp_file, job_config, executed_at, overwrite_table)
//         elif overwrite_table:
//             if len(df) == 0:
//                 print(json.dumps({"_tag": "error", "reason": "overwrite-empty-dataframe", "executedAt": executed_at}))
//                 return
//             _writeback_overwrite(client, table_name, temp_file, job_config, executed_at, overwrite_table)
//         elif len(df) == 0:
//             print(json.dumps({
//                 "_tag": "success",
//                 "dataSourceId": "placeholder",
//                 "tableName": table_name,
//                 "overwritten": False,
//                 "insertedRows": 0,
//                 "updatedRows": 0,
//                 "ignoredRows": 0,
//                 "executedAt": executed_at
//             }))
//         else:
//             _writeback_upsert(client, table_name, temp_file, job_config, df_columns, on_conflict, on_conflict_columns, table, executed_at, overwrite_table)

//     except Exception as e:
//         result = {
//             "_tag": "error",
//             "step": step,
//             "reason": "python-error",
//             "ename": type(e).__name__,
//             "evalue": str(e),
//             "executedAt": executed_at
//         }
//         print(json.dumps(result))
//     finally:
//         temp_file.close()
//         os.unlink(temp_file.name)

// def _writeback_new_table(client, table_name, temp_file, job_config, executed_at, overwrite_table):
//     import json
//     job = client.load_table_from_file(temp_file, table_name, job_config=job_config)
//     result = job.result()
//     print(json.dumps({
//         "_tag": "success",
//         "dataSourceId": "placeholder",
//         "tableName": table_name,
//         "overwritten": overwrite_table,
//         "insertedRows": result.output_rows,
//         "updatedRows": 0,
//         "ignoredRows": 0,
//         "executedAt": executed_at
//     }))

// def _writeback_overwrite(client, table_name, temp_file, job_config, executed_at, overwrite_table):
//     import json
//     # Delete all rows
//     client.query(f"DELETE FROM {table_name} WHERE 1=1").result()
//     # Insert new data
//     job = client.load_table_from_file(temp_file, table_name, job_config=job_config)
//     result = job.result()
//     print(json.dumps({
//         "_tag": "success",
//         "dataSourceId": "placeholder",
//         "tableName": table_name,
//         "overwritten": overwrite_table,
//         "insertedRows": result.output_rows,
//         "updatedRows": 0,
//         "ignoredRows": 0,
//         "executedAt": executed_at
//     }))

// def _writeback_upsert(client, table_name, temp_file, job_config, df_columns, on_conflict, on_conflict_columns, table, executed_at, overwrite_table):
//     import json, random, string
//     from google.api_core.exceptions import Conflict
    
//     # Create temp table
//     max_attempts = 5
//     temp_table_name = None
//     for attempt in range(max_attempts):
//         try:
//             random_part = ''.join(random.choices(string.ascii_letters + string.digits, k=10))
//             temp_table_name = f"{table_name}_{random_part}"
//             if table:
//                 temp_table = bigquery.Table(temp_table_name, schema=table.schema)
//                 client.create_table(temp_table)
//             job = client.load_table_from_file(temp_file, temp_table_name, job_config=job_config)
//             job.result()
//             break
//         except Conflict:
//             if attempt == max_attempts - 1:
//                 raise Exception(f"Failed to create temp table after {max_attempts} attempts")

//     try:
//         if len(on_conflict_columns) == 0:
//             # Simple insert
//             query = f"INSERT INTO {table_name} ({', '.join(df_columns)}) SELECT {', '.join(df_columns)} FROM {temp_table_name}"
//             job = client.query(query)
//             result = job.result()
//             inserted_rows = job.num_dml_affected_rows
//             updated_rows = 0
//             ignored_rows = 0
//         else:
//             # Merge with conflict handling
//             conflict_combination = " AND ".join([f"target.{col} = source.{col}" for col in on_conflict_columns])
            
//             if on_conflict == "update":
//                 merge_query = f"""
//                     MERGE INTO {table_name} target
//                     USING {temp_table_name} source
//                     ON {conflict_combination}
//                     WHEN MATCHED THEN
//                         UPDATE SET {", ".join([f"target.{col} = source.{col}" for col in df_columns])}
//                     WHEN NOT MATCHED THEN
//                         INSERT ({", ".join(df_columns)})
//                         VALUES ({", ".join([f"source.{col}" for col in df_columns])})
//                 """
//             else:  # ignore
//                 merge_query = f"""
//                     MERGE INTO {table_name} target
//                     USING {temp_table_name} source
//                     ON {conflict_combination}
//                     WHEN NOT MATCHED THEN
//                         INSERT ({", ".join(df_columns)})
//                         VALUES ({", ".join([f"source.{col}" for col in df_columns])})
//                 """
            
//             client.query(merge_query).result()
            
//             # Calculate stats
//             insert_count_query = f"""
//                 SELECT COUNT(*) FROM (
//                     SELECT source.{on_conflict_columns[0]} as s, target.{on_conflict_columns[0]} as t
//                     FROM {temp_table_name} source
//                     LEFT JOIN {table_name} target
//                     ON {conflict_combination}
//                 )
//                 WHERE t IS NULL
//             """
//             inserted_rows = list(client.query(insert_count_query).result())[0][0]
            
//             updated_rows = 0
//             if on_conflict == "update":
//                 update_query = f"""
//                     SELECT COUNT(*) FROM {temp_table_name} source
//                     INNER JOIN {table_name} target
//                     ON {conflict_combination}
//                 """
//                 updated_rows = list(client.query(update_query).result())[0][0]
            
//             ignored_rows = len(df) - inserted_rows - updated_rows

//         print(json.dumps({
//             "_tag": "success",
//             "dataSourceId": "placeholder",
//             "tableName": table_name,
//             "overwritten": overwrite_table,
//             "insertedRows": inserted_rows,
//             "updatedRows": updated_rows,
//             "ignoredRows": ignored_rows,
//             "executedAt": executed_at
//         }))
//     finally:
//         # Clean up temp table
//         client.query(f"DROP TABLE {temp_table_name}").result()

// if "${dataframeName}" in globals():
//     _sandworm_writeback(
//         ${dataframeName},
//         "${tableName}",
//         ${overwriteTable ? 'True' : 'False'},
//         "${onConflict}",
//         ${JSON.stringify(onConflictColumns)}
//     )
// else:
//     from datetime import datetime
//     import json
//     print(json.dumps({
//         "_tag": "error",
//         "step": "validation",
//         "reason": "dataframe-not-found",
//         "executedAt": datetime.now().isoformat()
//     }))
//         `;
//     }
// }