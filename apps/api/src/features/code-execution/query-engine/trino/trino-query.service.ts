import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Output, RunQueryResult, SuccessRunQueryResult } from '@sandworm/types';
import { AllConfigType } from '@/core/config/config.type';
import { PythonExecutorService } from '../../python-executor.service';
import { PythonQueryRunnerService } from '../python/python-query-runner.service';

export interface AdhocQueryResult {
  columns: string[];
  rows: unknown[][];
}

@Injectable()
export class TrinoQueryService {
  constructor(
    private readonly pythonExecutor: PythonExecutorService,
    private readonly queryRunner: PythonQueryRunnerService,
    private readonly configService: ConfigService<AllConfigType>,
  ) { }

  private buildConnectionUrl(): string {
    const { host, port, catalog, schema, user, password } = this.configService.getOrThrow('trino', { infer: true });
    const auth = password
      ? `${encodeURIComponent(user)}:${encodeURIComponent(password)}`
      : encodeURIComponent(user);
    const path = schema ? `${catalog}/${schema}` : catalog;
    return `trino://${auth}@${host}:${port}/${path}`;
  }

  async execute(
    workspaceId: string,
    sessionId: string,
    queryId: string,
    dataframeName: string,
    sql: string,
    resultOptions: { pageSize: number; dashboardPageSize: number },
    onProgress: (result: SuccessRunQueryResult) => void,
  ): Promise<[Promise<RunQueryResult>, () => Promise<void>]> {
    const rendered = await this.pythonExecutor.renderJinja({ workspaceId, sessionId }, sql);

    if (typeof rendered !== 'string') {
      return [
        Promise.resolve({ ...rendered, type: 'python-error' }),
        async () => { },
      ];
    }

    const databaseUrl = this.buildConnectionUrl();
    const queryCode = this.buildQueryCode(queryId, rendered, resultOptions, databaseUrl);
    const loadCode = this.buildLoadDataframeCode(queryId, dataframeName);
    const flagFilePath = `/home/sandwormuser/.sandworm/query-${queryId}.flag`;

    return this.queryRunner.runQuery(
      workspaceId,
      sessionId,
      queryCode,
      loadCode,
      flagFilePath,
      onProgress,
    );
  }

  buildQueryCode(
    queryId: string,
    sql: string,
    resultOptions: { pageSize: number; dashboardPageSize: number },
    databaseUrl: string,
  ): string {
    return `
def _sandworm_make_trino_query():
    import json, pandas as pd, os
    from sqlalchemy import create_engine, text

    base = "/home/sandwormuser/.sandworm/query-${queryId}"
    parquet = base + ".parquet.gzip"
    csv = base + ".csv"
    os.makedirs("/home/sandwormuser/.sandworm", exist_ok=True)

    page_size = ${resultOptions.pageSize}
    dashboard_page_size = ${resultOptions.dashboardPageSize}

    def hexlify_binary_columns(df):
        # Trino VARBINARY columns (hashes, addresses, raw calldata) come back
        # as raw bytes — pandas' to_json can't encode those as UTF-8. Hex
        # them, matching how blockchain data is normally displayed.
        for column in df.columns:
            if df[column].dtype != "object":
                continue
            sample = df[column].dropna()
            if len(sample) == 0 or not isinstance(sample.iloc[0], (bytes, bytearray, memoryview)):
                continue
            df[column] = df[column].apply(
                lambda v: ("0x" + bytes(v).hex()) if isinstance(v, (bytes, bytearray, memoryview)) else v
            )
        return df

    engine = create_engine(${JSON.stringify(databaseUrl)})
    try:
        with engine.connect() as conn:
            df = pd.read_sql_query(text(${JSON.stringify(sql)}), con=conn)

        df = hexlify_binary_columns(df)

        rows = json.loads(df.head(max(page_size, dashboard_page_size)).to_json(orient="records", date_format="iso"))
        for r in rows:
            for k in r:
                r[k] = str(r[k])

        columns = [{"name": c, "type": t.name} for c, t in df.dtypes.items()]

        result = {
            "version": 3,
            "type": "success",
            "columns": columns,
            "rows": rows[:page_size],
            "count": len(df),
            "page": 0,
            "pageSize": page_size,
            "pageCount": int(len(df) / page_size + 1) if page_size > 0 else 1,
            "dashboardPage": 0,
            "dashboardPageSize": dashboard_page_size,
            "dashboardPageCount": int(len(df) / dashboard_page_size + 1) if dashboard_page_size > 0 else 1,
            "dashboardRows": rows[:dashboard_page_size],
        }

        print(json.dumps(result, default=str))
        df.to_parquet(parquet, compression="gzip", index=False)
        df.to_csv(csv, index=False)

    except Exception as e:
        print(json.dumps({"type": "syntax-error", "message": f"[Trino] {e}"}))
    finally:
        engine.dispose()

_sandworm_make_trino_query()
`;
  }

  // For ad-hoc use outside the block-execution system (e.g. a "test query"
  // action) — runs the query and returns rows/columns directly, no
  // dataframe/parquet dance, no paging.
  async executeQuery(
    workspaceId: string,
    sessionId: string,
    sql: string,
  ): Promise<AdhocQueryResult> {
    const databaseUrl = this.buildConnectionUrl();
    const code = this.buildAdhocQueryCode(sql, databaseUrl);

    let output: AdhocQueryResult | null = null;
    let error: string | null = null;

    const { promise } = await this.pythonExecutor.executeCode(
      { workspaceId, sessionId },
      code,
      (outputs: Output[]) => {
        for (const o of outputs) {
          if (o.type === 'stdio' && o.name === 'stdout') {
            for (const line of o.text.trim().split('\n')) {
              if (!line) continue;
              try {
                const parsed = JSON.parse(line);
                if (parsed.type === 'success') {
                  output = { columns: parsed.columns, rows: parsed.rows };
                } else if (parsed.type === 'error') {
                  error = parsed.message;
                }
              } catch {
                // ignore non-JSON stdout lines
              }
            }
          }
          if (o.type === 'error') {
            error = `${o.ename}: ${o.evalue}`;
          }
        }
      },
      { storeHistory: false },
    );

    await promise;

    if (error) throw new Error(error);
    if (!output) throw new Error('[Trino] No result returned from query');
    return output;
  }

  private buildAdhocQueryCode(sql: string, databaseUrl: string): string {
    return `
import json
from sqlalchemy import create_engine, text

def hexlify(v):
    if isinstance(v, (bytes, bytearray, memoryview)):
        return "0x" + bytes(v).hex()
    return v

engine = create_engine(${JSON.stringify(databaseUrl)})
try:
    with engine.connect() as conn:
        result = conn.execute(text(${JSON.stringify(sql)}))
        columns = list(result.keys())
        rows = [[hexlify(v) for v in row] for row in result.fetchall()]
        print(json.dumps({"type": "success", "columns": columns, "rows": rows}, default=str))
except Exception as e:
    print(json.dumps({"type": "error", "message": f"[Trino] {e}"}))
finally:
    engine.dispose()
`;
  }

  buildLoadDataframeCode(queryId: string, dataframeName: string): string {
    return `
import pandas as pd, time

for _ in range(3):
    try:
        ${dataframeName} = pd.read_parquet("/home/sandwormuser/.sandworm/query-${queryId}.parquet.gzip")
        break
    except:
        time.sleep(1)
`;
  }
}
