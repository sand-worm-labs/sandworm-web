import { Injectable } from '@nestjs/common';
import { RunQueryResult, SuccessRunQueryResult } from '@sandworm/types';
import { PythonExecutorService } from '../../python-executor.service';
import { PythonQueryRunnerService } from '../python/python-query-runner.service';

@Injectable()
export class DuckDBQueryService {
  constructor(
    private readonly pythonExecutor: PythonExecutorService,
    private readonly queryRunner: PythonQueryRunnerService,
  ) { }

  async execute(
    workspaceId: string,
    sessionId: string,
    queryId: string,
    dataframeName: string,
    sql: string,
    resultOptions: { pageSize: number; dashboardPageSize: number },
    onProgress: (result: SuccessRunQueryResult) => void,
    knownDataframes: { name: string; queryId: string }[] = [],
  ): Promise<[Promise<RunQueryResult>, () => Promise<void>]> {
    const rendered = await this.pythonExecutor.renderJinja({ workspaceId, sessionId }, sql);

    if (typeof rendered !== 'string') {
      return [
        Promise.resolve({ ...rendered, type: 'python-error' }),
        async () => { },
      ];
    }

    const queryCode = this.buildQueryCode(queryId, rendered, resultOptions, knownDataframes);

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
    knownDataframes: { name: string; queryId: string }[] = [],
  ): string {
    // Any dataframe this query references by name should already be a
    // variable in this kernel — a preceding block's own run loads it there
    // (see buildLoadDataframeCode). But that only holds if this exact kernel
    // has been alive since that block last ran; a kernel restart (idle
    // cull, redeploy) or simply querying before re-running the source block
    // wipes it while its parquet file on disk survives. Reload anything
    // that's currently missing from globals so `SELECT * FROM <name>` is
    // self-sufficient instead of depending on kernel/run ordering.
    const preload = knownDataframes
      .map(({ name, queryId: sourceQueryId }) => `
    if "${name}" not in globals():
        try:
            globals()["${name}"] = pd.read_parquet("/home/sandwormuser/.sandworm/query-${sourceQueryId}.parquet.gzip")
        except Exception:
            pass`)
      .join("\n");

    return `
def _sandworm_make_duckdb_query():
    import duckdb, json, pandas as pd, os

    base = "/home/sandwormuser/.sandworm/query-${queryId}"
    parquet = base + ".parquet.gzip"
    csv = base + ".csv"
    os.makedirs("/home/sandwormuser/.sandworm", exist_ok=True)

    page_size = ${resultOptions.pageSize}
    dashboard_page_size = ${resultOptions.dashboardPageSize}
${preload}

    try:
        query = duckdb.query(${JSON.stringify(sql)})

        if query is None:
            print(json.dumps({"type": "success", "rows": [], "columns": [], "count": 0}))
            return

        df = query.df()
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
        print(json.dumps({"type": "syntax-error", "message": str(e)}))

_sandworm_make_duckdb_query()
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

  buildReadPageCode(
    queryId: string,
    dataframeName: string,
    pageOptions: any,
    sort: any,
  ): string {
    return `
import json, pandas as pd
sort_config = json.loads(${JSON.stringify(JSON.stringify(sort))})

if "${dataframeName}" not in globals():
    try:
        ${dataframeName} = pd.read_parquet("/home/sandwormuser/.sandworm/query-${queryId}.parquet.gzip")
    except:
        print(json.dumps({"type": "not-found"}))
        raise SystemExit

df = ${dataframeName}

if sort_config:
    try:
        df = df.sort_values(sort_config["column"], ascending=sort_config["order"] == "asc")
    except:
        pass

start = ${pageOptions.page * pageOptions.pageSize}
end = ${(pageOptions.page + 1) * pageOptions.pageSize}

rows = json.loads(df.iloc[start:end].to_json(orient="records", date_format="iso"))
for r in rows:
    for k in r:
        r[k] = str(r[k])

print(json.dumps({
    "type": "success",
    "rows": rows,
    "count": len(df),
}))
`;
  }
}
