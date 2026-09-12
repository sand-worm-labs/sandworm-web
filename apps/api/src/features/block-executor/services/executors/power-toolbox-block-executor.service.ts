import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as Y from 'yjs';
import {
  ExecutionQueueItem,
  PowerToolboxBlock,
  getPowerToolboxAttributes,
} from '@sandworm/editor';
import { DocumentContext } from '../../interfaces';
import { DataFrameService } from '@/features/code-execution/query-engine/dataframe/dataframe.service';
import { PythonExecutorService } from '@/features/code-execution/python-executor.service';
import { TrinoQueryService } from '@/features/code-execution/query-engine/trino/trino-query.service';
import { ToolService } from '@/features/tool/tool.service';
import { BlockExecutorDataframeService } from '../block-executor-dataframe.service';

@Injectable()
export class PowerToolboxBlockExecutorService {
  private readonly logger = new Logger(PowerToolboxBlockExecutorService.name);

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly dataframeService: DataFrameService,
    private readonly pythonExecutorService: PythonExecutorService,
    private readonly trinoQueryService: TrinoQueryService,
    private readonly toolService: ToolService,
    private readonly blockExecutorDataframeService: BlockExecutorDataframeService,
  ) { }

  // A bare-SQL tool template gets wrapped by renderTool() into source that
  // calls _sandworm_query(sql) (see @sandworm/editor's wrapSqlInPython) —
  // but nothing defines it in the kernel. This preamble does. Namespaced
  // rather than a bare `query` since the kernel session is persisted
  // (storeHistory: true) and could otherwise collide with a user's own
  // variable of that name.
  //
  // datasource mirrors DATA_SOURCE_QUERY_ENGINE's split on the manual
  // SQL-block path: "trino" for a fresh pull against Dune's catalog,
  // "duckdb" to query a dataframe this session already loaded (e.g. a
  // variable another block put in scope) without round-tripping to Dune.
  // Defaults to "trino" since most tool templates are a first-touch pull.
  private buildQueryPreamble(): string {
    return `
def _sandworm_query(sql, datasource="trino"):
    import pandas as pd

    if datasource == "duckdb":
        import duckdb
        result = duckdb.query(sql)
        return result.df() if result is not None else pd.DataFrame()

    if datasource != "trino":
        raise ValueError(f"Unknown datasource: {datasource!r} (expected 'trino' or 'duckdb')")

    from sqlalchemy import create_engine, text

    engine = create_engine(${JSON.stringify(this.trinoQueryService.buildConnectionUrl())})
    try:
        with engine.connect() as conn:
            return pd.read_sql_query(text(sql), con=conn)
    finally:
        engine.dispose()
`;
  }

  async run(
    context: { workspaceId: string; sessionId: string },
    executionItem: ExecutionQueueItem,
    block: Y.XmlElement<PowerToolboxBlock>,
    ctx: DocumentContext,
  ): Promise<void> {
    const { id: blockId, toolId, inputs } = getPowerToolboxAttributes(block);

    if (!toolId) {
      block.setAttribute('result', [
        {
          type: 'error',
          ename: 'NoTool',
          evalue: 'No tool selected for this block yet.',
          traceback: [],
        },
      ]);
      executionItem.setCompleted('error');
      return;
    }

    // Rendered fresh from the tool's template + this block's current inputs
    // on every run — the template never gets cached onto the block itself,
    // so an edit to inputs is always reflected without a separate "regenerate"
    // step.
    let generatedSource: string;
    try {
      generatedSource = await this.toolService.renderToolSource(toolId, inputs);
    } catch (err) {
      block.setAttribute('result', [
        {
          type: 'error',
          ename: 'RenderError',
          evalue: `Failed to render tool "${toolId}": ${(err as Error).message}`,
          traceback: [],
        },
      ]);
      executionItem.setCompleted('error');
      return;
    }

    this.eventEmitter.emit('powertoolbox.run', { ...ctx.execution, blockId });
    block.setAttribute('result', []);
    block.setAttribute('startedAt', new Date().toISOString());

    try {
      let errored = false;
      const { promise, abort } = await this.pythonExecutorService.executeCode(
        context,
        this.buildQueryPreamble() + generatedSource,
        (outputs) => {
          const prevOutputs = block.getAttribute('result') ?? [];
          block.setAttribute('result', prevOutputs.concat(outputs));
          if (!errored && outputs.some((o) => o.type === 'error')) {
            errored = true;
          }
        },
        { storeHistory: true },
      );

      let abortP = Promise.resolve(false);
      const cleanup = executionItem.observeStatus((status) => {
        if (status._tag === 'aborting') {
          abortP = abort().then(() => true);
        }
      });

      await promise;
      const aborted = await abortP;

      if (aborted) {
        executionItem.setCompleted('aborted');
        cleanup();
        return;
      }

      await this.updateDataFrames(context, blockId, ctx);

      block.setAttribute('executedAt', new Date().toISOString());
      block.setAttribute('lastExecutedInputs', inputs);
      executionItem.setCompleted(errored ? 'error' : 'success');
      cleanup();
    } catch (err) {
      this.logger.error({ ...ctx.execution, blockId, err }, 'PowerToolbox execution error');
      executionItem.setCompleted('error');
    }
  }

  private async updateDataFrames(
    context: { workspaceId: string; sessionId: string },
    blockId: string,
    ctx: DocumentContext,
  ): Promise<void> {
    await this.dataframeService.list(context);
    const blocks = new Set(Array.from(ctx.blocks.keys()));
    await this.blockExecutorDataframeService.updateDataframes(context, blockId, blocks, ctx.dataframes);
  }
}
