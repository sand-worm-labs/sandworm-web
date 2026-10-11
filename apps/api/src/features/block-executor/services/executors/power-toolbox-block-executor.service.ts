import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { EnvironmentVariableEntity } from '@sandworm/postgresql-typeorm';
import { In, Repository } from 'typeorm';
import * as Y from 'yjs';
import {
  ExecutionQueueItem,
  PowerToolboxBlock,
  dfNameFromToolId,
  getPowerToolboxAttributes,
} from '@sandworm/editor';
import { DocumentContext } from '../../interfaces';
import { DataFrameService } from '@/features/code-execution/query-engine/dataframe/dataframe.service';
import { PythonExecutorService } from '@/features/code-execution/python-executor.service';
import { ToolService } from '@/features/tool/tool.service';
import { BlockExecutorDataframeService } from '../block-executor-dataframe.service';

// A tool whose required environment variables aren't set on the workspace is
// not run: the block shows which ones to add (the web app matches this name,
// like PaidPlanRequired for SQL). `traceback` carries the missing names.
export const MISSING_ENV_ERROR = 'MissingEnvironmentVariables';

@Injectable()
export class PowerToolboxBlockExecutorService {
  private readonly logger = new Logger(PowerToolboxBlockExecutorService.name);

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly dataframeService: DataFrameService,
    private readonly pythonExecutorService: PythonExecutorService,
    private readonly toolService: ToolService,
    private readonly blockExecutorDataframeService: BlockExecutorDataframeService,
    @InjectRepository(EnvironmentVariableEntity)
    private readonly envVarRepository: Repository<EnvironmentVariableEntity>,
  ) { }

  // Names only: values are never read here.
  private async missingEnv(workspaceId: string, toolId: string): Promise<string[]> {
    const required = await this.toolService.getRequiredEnv(toolId);
    if (required.length === 0) return [];

    const set = await this.envVarRepository.find({
      where: { workspaceId, name: In(required.map((v) => v.name)) },
      select: { id: true, name: true },
    });
    const have = new Set(set.map((v) => v.name));
    return required.map((v) => v.name).filter((name) => !have.has(name));
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

    const missing = await this.missingEnv(context.workspaceId, toolId);
    if (missing.length > 0) {
      block.setAttribute('result', [
        {
          type: 'error',
          ename: MISSING_ENV_ERROR,
          evalue: `This tool needs ${missing.join(', ')} in your workspace's environment variables.`,
          traceback: missing,
        },
      ]);
      executionItem.setCompleted('error');
      return;
    }

    // Rendered fresh from the tool's template + this block's current inputs
    // on every run — the template never gets cached onto the block itself,
    // so an edit to inputs is always reflected without a separate "regenerate"
    // step.
    //
    // The kernel session is persisted across blocks (storeHistory: true), so
    // if this tool's plain dataframe name is already bound to something in
    // this session — e.g. this same tool already ran from another block —
    // reusing it would silently overwrite that variable. Check the session's
    // live globals and, if taken, suffix with the smallest free number
    // (2, 3, ...) rather than a long, unreadable id.
    const existingDfNames = new Set(
      (await this.dataframeService.list(context)).map((df) => df.name),
    );
    const baseDfName = dfNameFromToolId(toolId);
    let dfSuffix: number | undefined;
    if (existingDfNames.has(baseDfName)) {
      dfSuffix = 2;
      while (existingDfNames.has(dfNameFromToolId(toolId, dfSuffix))) {
        dfSuffix += 1;
      }
    }

    let generatedSource: string;
    try {
      generatedSource = await this.toolService.renderToolSource(toolId, inputs, dfSuffix);
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
        generatedSource,
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
      // The abort may have been requested while the kernel session was still
      // being set up, before the observer above existed.
      if (executionItem.getStatus()._tag === 'aborting') {
        abortP = abort().then(() => true);
      }

      await promise;
      const aborted = await abortP;

      if (aborted) {
        executionItem.setCompleted('aborted');
        cleanup();
        return;
      }

      await this.updateDataFrames(context, blockId, ctx);
 
      await this.dataframeService.exportBlockResult(context, blockId, {
        dataframeName: dfNameFromToolId(toolId, dfSuffix),
      });

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
