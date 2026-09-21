import { Injectable, Logger } from '@nestjs/common';
import {
  AbortErrorRunQueryResult,
  DataFrame,
  PythonErrorRunQueryResult,
  SuccessRunQueryResultV2,
  SyntaxErrorRunQueryResult,
  TableSort,
} from '@sandworm/types';
import { PythonExecutorService } from '../../python-executor.service';

export type BlockResultSource =
  | { dataframeName: string }
  | { executionCount: number | null };

export type ReadDataFramePageResult =
  | Omit<SuccessRunQueryResultV2, 'queryDurationMs'>
  | SyntaxErrorRunQueryResult
  | AbortErrorRunQueryResult
  | PythonErrorRunQueryResult;

@Injectable()
export class DataFrameService {
  private readonly logger = new Logger(DataFrameService.name);

  constructor(private readonly pythonExecutor: PythonExecutorService) { }

  async rename(context: { workspaceId: string; sessionId: string }, from: string, to: string): Promise<void> {
    const code = `if "${from}" in globals():
    ${to} = ${from}
    del ${from}`;
    await (
      await this.pythonExecutor.executeCode(context, code, () => { }, {
        storeHistory: false,
      })
    ).promise;
  }

  async list(context: { workspaceId: string; sessionId: string }): Promise<DataFrame[]> {
    const code = `
            import pandas as pd, json
            dfs = []
            for k,v in globals().items():
                if isinstance(v, pd.DataFrame):
                    dfs.append({"name": k})
            print(json.dumps(dfs))
        `;
    let result: DataFrame[] = [];

    await (
      await this.pythonExecutor.executeCode(
        context,
        code,
        (outputs) => {
          for (const o of outputs) {
            if (o.type === 'stdio') {
              result = JSON.parse(o.text);
            }
          }
        },
        { storeHistory: false },
      )
    ).promise;

    return result;
  }

  /**
   * Saves a block's result DataFrame as `.sandworm/query-<blockId>.csv` and
   * `.parquet.gzip`, the same files SQL blocks write, so the CSV endpoint and
   * "use in new block" can serve it. `source` is either the variable the block
   * wrote to, or the cell's `Out[n]` count (its last displayed expression).
   * Best-effort: never throws.
   */
  async exportBlockResult(
    context: { workspaceId: string; sessionId: string },
    blockId: string,
    source: BlockResultSource,
  ): Promise<void> {
    try {
      await (
        await this.pythonExecutor.executeCode(context, this.buildExportBlockResultCode(blockId, source), () => { }, {
          storeHistory: false,
        })
      ).promise;
    } catch (err) {
      this.logger.warn({ ...context, blockId, source, err }, 'Failed to export block result');
    }
  }

  buildExportBlockResultCode(blockId: string, source: BlockResultSource): string {
    let findResult = 'None';
    if ('dataframeName' in source) {
      findResult = `ip.user_ns.get(${JSON.stringify(source.dataframeName)})`;
    } else if (typeof source.executionCount === 'number') {
      findResult = `ip.user_ns.get("Out", {}).get(${Number(source.executionCount)})`;
    }

    return `
def _sandworm_export_result():
    import os
    import pandas as pd

    base = "/home/sandwormuser/.sandworm/query-${blockId}"
    csv = base + ".csv"
    parquet = base + ".parquet.gzip"

    # Drop the previous run's files first so a run that no longer displays a
    # DataFrame (or fails halfway through) can't leave a stale result behind.
    for path in (csv, parquet):
        if os.path.exists(path):
            os.remove(path)

    ip = get_ipython()
    df = ${findResult}
    if not isinstance(df, pd.DataFrame):
        return

    os.makedirs(os.path.dirname(base), exist_ok=True)

    # Shallow copy so stringifying column labels (parquet requires it) doesn't
    # touch the user's own dataframe.
    out = df.copy(deep=False)
    out.columns = [str(c) for c in out.columns]

    # The table UI hides the index, so a default RangeIndex is noise in the
    # CSV — but a meaningful one (e.g. the labels of a correlation matrix)
    # must be kept.
    out.to_csv(csv, index=not isinstance(out.index, pd.RangeIndex))

    try:
        out.to_parquet(parquet, compression="gzip")
    except Exception:
        # Parquet is stricter than pandas: it rejects object columns holding
        # mixed types (e.g. ints and strings) and duplicate column names, both
        # common in messy data. Retry on a private copy with duplicate names
        # suffixed and object columns stringified (nulls preserved) so the
        # "use in new block" copy still loads — those columns come back as
        # strings. The CSV above is unaffected.
        try:
            safe = out.copy()
            names, seen = [], {}
            for name in safe.columns:
                count = seen.get(name, 0)
                seen[name] = count + 1
                names.append(name if count == 0 else f"{name}_{count}")
            safe.columns = names
            for i in range(safe.shape[1]):
                column = safe.iloc[:, i]
                if column.dtype == "object":
                    safe.isetitem(i, column.where(column.isna(), column.astype(str)))
            safe.to_parquet(parquet, compression="gzip")
        except Exception:
            # Don't leave a partial file that a new block would try to load.
            if os.path.exists(parquet):
                os.remove(parquet)

try:
    _sandworm_export_result()
except Exception:
    pass
finally:
    del _sandworm_export_result
`;
  }

  private handleStdoutOutput(
    line: string,
    result: { value: ReadDataFramePageResult | null },
    error: { value: Error | null },
  ): void {
    const parsed = JSON.parse(line.trim());
    switch (parsed.type) {
      case 'success':
        result.value = parsed;
        break;
      case 'not-found':
        result.value = null;
        break;
      default:
        error.value = new Error('Unexpected output: ' + line);
    }
  }

  private handleErrorOutput(
    output: any,
    result: { value: ReadDataFramePageResult | null },
  ): void {
    result.value = {
      type: 'python-error',
      ename: output.ename,
      evalue: output.evalue,
      traceback: output.traceback,
    };
  }

  private processOutputs(
    outputs: any[],
    result: { value: ReadDataFramePageResult | null },
    error: { value: Error | null },
  ): void {
    if (error.value) {
      return;
    }

    for (const output of outputs) {
      if (output.type === 'stdio' && output.name === 'stdout') {
        const lines = output.text.trim().split('\n');
        for (const line of lines) {
          this.handleStdoutOutput(line, result, error);
        }
      }

      if (output.type === 'error') {
        this.handleErrorOutput(output, result);
      }
    }
  }

  async readPage(
    context: { workspaceId: string; sessionId: string },
    queryId: string,
    dataframeName: string,
    pageOptions: {
      page: number;
      pageSize: number;
      dashboardPage: number;
      dashboardPageSize: number;
    },
    sort: TableSort | null,
  ): Promise<ReadDataFramePageResult> {
    const code = `import json

sort_config = json.loads(${JSON.stringify(JSON.stringify(sort))})

if not ("${dataframeName}" in globals()):
    import pandas as pd
    try:
      ${dataframeName} = pd.read_parquet("/home/sandwormuser/.sandworm/query-${queryId}.parquet.gzip")
    except:
      print(json.dumps({"type": "not-found"}))

if "${dataframeName}" in globals():
    start = ${pageOptions.page * pageOptions.pageSize}
    end = (${pageOptions.page} + 1) * ${pageOptions.pageSize}

    dashboard_start = ${pageOptions.dashboardPage * pageOptions.dashboardPageSize}
    dashboard_end = (${pageOptions.dashboardPage} + 1) * ${pageOptions.dashboardPageSize}

    df = ${dataframeName}
    if sort_config:
        try:
            df = df.sort_values(by=sort_config["column"], ascending=sort_config["order"] == "asc")
        except:
            # try sorting as string
            try:
                df = df.sort_values(by=sort_config["column"], ascending=sort_config["order"] == "asc", key=lambda x: x.astype(str))
            except:
                pass

    rows = json.loads(df.iloc[start:end].to_json(orient="records", date_format="iso"))
    dashboard_rows = json.loads(df.iloc[dashboard_start:dashboard_end].to_json(orient="records", date_format="iso"))

    # convert all values to string to make sure we preserve the python values
    # when displaying this data in the browser
    for row in rows:
        for key in row:
            row[key] = str(row[key])

    columns = [{"name": col, "type": dtype.name} for col, dtype in ${dataframeName}.dtypes.items()]
    result = {
      "version": 3,
      "type": "success",
      "rows": rows,
      "count": len(${dataframeName}),
      "columns": columns,

      "page": ${pageOptions.page},
      "pageSize": ${pageOptions.pageSize},
      "pageCount": int(len(${dataframeName}) / ${pageOptions.pageSize} + 1) if ${pageOptions.pageSize} > 0 else 1,

      "dashboardPage": ${pageOptions.dashboardPage},
      "dashboardPageSize": ${pageOptions.dashboardPageSize},
      "dashboardPageCount": int(len(${dataframeName}) / ${pageOptions.dashboardPageSize} + 1) if ${pageOptions.dashboardPageSize} > 0 else 1,
      "dashboardRows": dashboard_rows,
    }
    print(json.dumps(result))`;

    const result = { value: null as ReadDataFramePageResult | null };
    const error = { value: null as Error | null };

    await (
      await this.pythonExecutor.executeCode(
        context,
        code,
        (outputs) => this.processOutputs(outputs, result, error),
        { storeHistory: false },
      )
    ).promise;

    if (error.value) {
      throw error.value;
    }

    if (!result.value) {
      throw new Error('No result');
    }

    return result.value;
  }
}
