import { Logger } from "@nestjs/common";
import {
    PivotTableColumn,
    PivotTableMetric,
    PivotTableRow,
} from '@sandworm/editor'
import {
    AggregateFunction,
    DataFrame,
    Output,
    PivotTableResult,
    PivotTableSort,
    jsonString,
} from '@sandworm/types'
import { PythonExecutionError, PythonStderrError } from "./python-executor.errors"
import {
    PythonExecutorService,
} from './python-executor.service'
import { z } from 'zod'
import AggregateError from 'aggregate-error'


interface PivotTableConfig {
    dataframe: DataFrame
    rows: PivotTableRow[]
    columns: PivotTableColumn[]
    metrics: PivotTableMetric[]
    sort: PivotTableSort | null
    varName: string
    page: number
    operation: 'create' | 'read'
}

interface MetricInfo {
    name: string
    aggregateFunction: AggregateFunction
}

const CreatePivotTableOutput = z.union([
    z.object({
        success: z.literal(true),
        result: PivotTableResult,
    }),
    z.object({
        success: z.literal(false),
        reason: z.union([z.literal('aborted'), z.literal('dataframe-not-found')]),
    }),
])

type CreatePivotTableOutput = z.infer<typeof CreatePivotTableOutput>

export interface CreatePivotTableResult {
    promise: Promise<CreatePivotTableOutput>
    abort: () => Promise<void>
}


export class PivotTableService {
    private static readonly PAGE_SIZE = 50
    private readonly logger = new Logger(PivotTableService.name);
    private readonly executor: PythonExecutorService;

    constructor(
        private readonly workspaceId: string,
        private readonly sessionId: string
    ) { }

    async createPivotTable(config: PivotTableConfig): Promise<CreatePivotTableResult> {
        const code = this.generatePythonCode(config)
        let outputs: Output[] = []

        const { abort, promise } = await this.executor.executeCode(
            this.workspaceId,
            this.sessionId,
            code,
            (otps) => {
                outputs = outputs.concat(otps)
            },
            { storeHistory: true }
        )

        const processedPromise = promise.then(() =>
            this.processOutputs(outputs, config.varName, config.dataframe.name)
        )

        return {
            promise: processedPromise,
            abort,
        }
    }

    private generatePythonCode(config: PivotTableConfig): string {
        const rowNames = this.extractColumnNames(config.rows)
        const colNames = this.extractColumnNames(config.columns)
        const metricNames = this.extractMetricInfo(config.metrics)

        return `
import json

def _sandworm_print_pivot_table_page(pivot_table, rows, columns, metrics, sort, page=1, page_size=50):
    import numpy as np

    page_count = (len(pivot_table) // page_size) + 1
    if page > page_count:
        page = page_count
    elif page < 1:
        page = 1

    pivot_table = pivot_table.replace([np.nan], 0)

    if sort:
        try:
            if sort["_tag"] == "row":
                pivot_table = pivot_table.sort_index(level=sort["row"], ascending=sort["order"] == "asc")
            elif sort["_tag"] == "column":
                if len(sort["columnValues"]) == 1:
                    by = sort["columnValues"][0]
                else:
                    by = ()
                    for cv in sort["columnValues"]:
                        by += (cv,)

                pivot_table = pivot_table.reindex(
                    pivot_table[sort["metric"]].sort_values(
                        by=by,
                        ascending=sort["order"] == "asc"
                    ).index
                )

        except Exception as e:
            print(json.dumps({"log": "Failed to sort pivot table", "error": str(e)}, default=str))
            pass

    table = pivot_table.iloc[page_size * (page - 1): page_size * page]

    result = {
      "page": page,
      "pageSize": page_size,
      "pageCount": page_count,
      "data": table.to_dict(orient="split"),
      "pivotRows": rows,
      "pivotColumns": columns,
      "pivotMetrics": [m["name"] for m in metrics],
    }

    print(json.dumps({"success": True, "result": result}, default=str, allow_nan=False))


def _sandworm_create_pivot_table(df, rows, columns, metrics, sort, page=1, page_size=50):
    aggfunc = {}
    for m in metrics:
        aggfunc[m["name"]] = m["aggregateFunction"]

    pivot_table = df.pivot_table(
        index=rows,
        columns=columns,
        values=[m["name"] for m in metrics],
        aggfunc=aggfunc
    )

    _sandworm_print_pivot_table_page(pivot_table, rows, columns, metrics, sort, page, page_size)

    return pivot_table


def _sandworm_pivot_table_run():
    if "${config.dataframe.name}" in globals():
        df = globals()["${config.dataframe.name}"]
        rows = json.loads(${JSON.stringify(JSON.stringify(rowNames))})
        columns = json.loads(${JSON.stringify(JSON.stringify(colNames))})
        metrics = json.loads(${JSON.stringify(JSON.stringify(metricNames))})
        sort = json.loads(${JSON.stringify(JSON.stringify(config.sort))})
        page = ${config.page}
        page_size = ${PivotTableService.PAGE_SIZE}
        operation = "${config.operation}"

        if operation == "read":
            if "${config.varName}" in globals():
                _sandworm_print_pivot_table_page(
                    globals()["${config.varName}"],
                    rows=rows,
                    columns=columns,
                    metrics=metrics,
                    sort=sort,
                    page=page,
                    page_size=page_size
                )
            else:
                globals()["${config.varName}"] = _sandworm_create_pivot_table(
                    df,
                    rows=rows,
                    columns=columns,
                    metrics=metrics,
                    sort=sort,
                    page=page,
                    page_size=page_size
                )

        else:
            globals()["${config.varName}"] = _sandworm_create_pivot_table(
                ${config.dataframe.name},
                rows=rows,
                columns=columns,
                metrics=metrics,
                sort=sort,
                page=1,
                page_size=page_size
            )
    else:
        print(json.dumps({"success": False, "reason": "dataframe-not-found"}))

_sandworm_pivot_table_run()`
    }

    private extractColumnNames(
        items: PivotTableRow[] | PivotTableColumn[]
    ): string[] {
        return items
            .map((item) => item.column?.name?.toString())
            .filter((name): name is string => name !== undefined)
    }

    private extractMetricInfo(metrics: PivotTableMetric[]): MetricInfo[] {
        return metrics.reduce<MetricInfo[]>((acc, m) => {
            if (m.column) {
                return acc.concat([
                    {
                        name: m.column.name.toString(),
                        aggregateFunction: m.aggregateFunction ?? 'count',
                    },
                ])
            }
            return acc
        }, [])
    }

    private processOutputs(
        outputs: Output[],
        varName: string,
        dataframeName: string
    ): CreatePivotTableOutput {
        const errors: Error[] = []

        for (const output of outputs) {
            if (output.type === 'error') {
                if (output.ename === 'KeyboardInterrupt') {
                    return {
                        success: false,
                        reason: 'aborted',
                    }
                }

                throw new PythonExecutionError(
                    output.type,
                    output.ename,
                    output.evalue,
                    output.traceback,
                    `Got error while creating pivot table "${varName}" from dataframe "${dataframeName}"`
                )
            }

            if (output.type === 'stdio') {
                if (output.name === 'stderr') {
                    errors.push(
                        new PythonStderrError(
                            this.workspaceId,
                            this.sessionId,
                            output.text,
                            `Got stderr while creating pivot table "${varName}" from dataframe "${dataframeName}"`
                        )
                    )
                    continue
                }

                const result = this.parseStdoutOutput(output.text)
                if (result) {
                    return result
                }

                errors.push(new Error(`Failed to parse output: ${output.text}`))
            }
        }

        if (errors.length > 0) {
            throw new AggregateError(errors)
        }

        throw new Error(
            `Got no output while creating pivot table "${varName}" from dataframe "${dataframeName}"`
        )
    }

    private parseStdoutOutput(text: string): CreatePivotTableOutput | null {
        for (const line of text.split('\n')) {
            const result = jsonString
                .pipe(
                    z.union([
                        CreatePivotTableOutput,
                        z.object({
                            log: z.string(),
                            error: z.string(),
                        }),
                    ])
                )
                .safeParse(line)

            if (result.success) {
                if ('log' in result.data) {
                    this.logger.error(
                        {
                            workspaceId: this.workspaceId,
                            sessionId: this.sessionId,
                            error: result.data.error,
                            log: result.data.log,
                        },
                        'Got log while creating pivot table'
                    )
                    continue
                }

                return result.data
            }
        }

        return null
    }
}