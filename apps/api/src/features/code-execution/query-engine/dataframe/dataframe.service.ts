import { Injectable } from '@nestjs/common';
import {
  AbortErrorRunQueryResult,
  DataFrame,
  PythonErrorRunQueryResult,
  SuccessRunQueryResultV2,
  SyntaxErrorRunQueryResult,
  TableSort,
} from '@sandworm/types';
import { PythonExecutorService } from '../../python-executor.service';

export type ReadDataFramePageResult =
  | Omit<SuccessRunQueryResultV2, 'queryDurationMs'>
  | SyntaxErrorRunQueryResult
  | AbortErrorRunQueryResult
  | PythonErrorRunQueryResult;

@Injectable()
export class DataFrameService {
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
      ${dataframeName} = pd.read_parquet("/home/sandwormuser/.briefer/query-${queryId}.parquet.gzip")
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
      "pageCount": int(len(${dataframeName}) / ${pageOptions.pageSize} + 1),

      "dashboardPage": ${pageOptions.dashboardPage},
      "dashboardPageSize": ${pageOptions.dashboardPageSize},
      "dashboardPageCount": int(len(${dataframeName}) / ${pageOptions.dashboardPageSize} + 1),
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
