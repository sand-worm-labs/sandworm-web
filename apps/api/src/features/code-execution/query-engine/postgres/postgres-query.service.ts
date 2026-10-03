import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RunQueryResult, SuccessRunQueryResult } from '@sandworm/types';
import { PythonExecutorService } from '../../python-executor.service';
import { PythonQueryRunnerService } from '../python/python-query-runner.service';

// Runs SQL blocks against the Sandworm Cloud Postgres database, the same way
// TrinoQueryService does for Dune: the query runs in the kernel via
// SQLAlchemy and lands in a dataframe. Connection comes from
// SANDWORM_CLOUD_DB_{HOST,PORT,NAME,USER,PASSWORD}.
@Injectable()
export class PostgresQueryService {
  constructor(
    private readonly pythonExecutor: PythonExecutorService,
    private readonly queryRunner: PythonQueryRunnerService,
    private readonly configService: ConfigService,
  ) { }

  buildConnectionUrl(): string {
    const get = (k: string) => this.configService.get<string>(`SANDWORM_CLOUD_DB_${k}`);
    const host = get('HOST');
    if (!host) throw new ForbiddenException('Sandworm Cloud is not configured');

    const user = encodeURIComponent(get('USER') ?? 'postgres');
    const password = get('PASSWORD');
    const auth = password ? `${user}:${encodeURIComponent(password)}` : user;
    const sslmode = get('SSL') === 'false' ? 'disable' : 'require';
    return `postgresql+psycopg2://${auth}@${host}:${get('PORT') ?? 5432}/${get('NAME') ?? 'postgres'}?sslmode=${sslmode}`;
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
def _sandworm_make_postgres_query():
    import json, pandas as pd, os
    from sqlalchemy import create_engine, text

    base = "/home/sandwormuser/.sandworm/query-${queryId}"
    parquet = base + ".parquet.gzip"
    csv = base + ".csv"
    os.makedirs("/home/sandwormuser/.sandworm", exist_ok=True)

    page_size = ${resultOptions.pageSize}
    dashboard_page_size = ${resultOptions.dashboardPageSize}

    def hexlify_binary_columns(df):
        # bytea columns come back as raw bytes — pandas' to_json can't encode
        # those as UTF-8. Hex them, matching how the Trino path displays them.
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
        print(json.dumps({"type": "syntax-error", "message": f"[Postgres] {e}"}))
    finally:
        engine.dispose()

_sandworm_make_postgres_query()
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
