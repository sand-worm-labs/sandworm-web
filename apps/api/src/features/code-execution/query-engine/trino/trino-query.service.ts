import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RunQueryResult, SuccessRunQueryResult } from '@sandworm/types';
import { AllConfigType } from '@/core/config/config.type';
import { PythonExecutorService } from '../../python-executor.service';
import { PythonQueryRunnerService } from '../python/python-query-runner.service';
import { buildTrinoConnectionUrl } from './trino-connection-url.util';

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

  buildConnectionUrl(): string {
    return buildTrinoConnectionUrl(this.configService.getOrThrow('trino', { infer: true }));
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

    # The kernel outlives the query, so keep one pooled engine per URL and
    # reuse its HTTP session instead of reconnecting every run. No pre_ping:
    # Trino is stateless HTTP and the default ping would be a full SELECT 1.
    engines = globals().setdefault("_sandworm_trino_engines", {})
    database_url = ${JSON.stringify(databaseUrl)}
    engine = engines.get(database_url)
    if engine is None:
        engine = engines[database_url] = create_engine(database_url, pool_recycle=300)
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

_sandworm_make_trino_query()
`;
  }

  // For ad-hoc use outside the block-execution system (e.g. a "test query"
  // action). Talks to Trino's REST protocol directly — no Python kernel, no
  // row cap, no timeout.
  async executeQuery(sql: string): Promise<AdhocQueryResult> {
    const { host, port, catalog, schema, user, password, httpScheme } = this.configService.getOrThrow('trino', {
      infer: true,
    });
    const headers: Record<string, string> = {
      'X-Trino-User': user,
      'X-Trino-Catalog': catalog,
      'Content-Type': 'text/plain',
      ...(schema ? { 'X-Trino-Schema': schema } : {}),
      ...(password ? { Authorization: `Basic ${Buffer.from(`${user}:${password}`).toString('base64')}` } : {}),
    };

    let res = await fetch(`${httpScheme}://${host}:${port}/v1/statement`, { method: 'POST', headers, body: sql });
    let columns: { name: string; type: string }[] = [];
    const rows: unknown[][] = [];

    for (;;) {
      if (!res.ok) throw new Error(`[Trino] HTTP ${res.status}: ${(await res.text()).slice(0, 500)}`);
      const page = (await res.json()) as {
        columns?: { name: string; type: string }[];
        data?: unknown[][];
        error?: { message: string };
        nextUri?: string;
      };
      if (page.error) throw new Error(`[Trino] ${page.error.message}`);
      if (page.columns) columns = page.columns;
      if (page.data) rows.push(...page.data);
      if (!page.nextUri) break;
      res = await fetch(page.nextUri, { headers });
    }

    // VARBINARY comes back base64: show it as 0x-hex like the block path does.
    const binary = columns.map(c => c.type === 'varbinary');
    return {
      columns: columns.map(c => c.name),
      rows: binary.some(Boolean)
        ? rows.map(r => r.map((v, i) => (binary[i] && typeof v === 'string' ? '0x' + Buffer.from(v, 'base64').toString('hex') : v)))
        : rows,
    };
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
