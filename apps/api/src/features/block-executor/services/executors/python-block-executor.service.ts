import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as Y from 'yjs';
import {
  ExecutionQueueItem,
  ExecutionQueueItemPythonMetadata,
  PythonBlock,
  getPythonAttributes,
} from '@sandworm/editor';
import { DocumentContext } from '../../interfaces';
import { DataFrameService } from '@/features/code-execution/query-engine/dataframe/dataframe.service';
import { PythonExecutorService } from '@/features/code-execution/python-executor.service';

@Injectable()
export class PythonBlockExecutorService {
  private readonly logger = new Logger(PythonBlockExecutorService.name);

  constructor(private readonly eventEmitter: EventEmitter2) { }

  async run(
    executionItem: ExecutionQueueItem,
    block: Y.XmlElement<PythonBlock>,
    ctx: DocumentContext,
    metadata: ExecutionQueueItemPythonMetadata,
  ): Promise<void> {
    this.eventEmitter.emit('python.run', { ...ctx.execution, blockId: block.getAttribute('id') });
    block.setAttribute('result', []);

    try {
      block.setAttribute('startQueryTime', new Date().toISOString());

      const { aiSuggestions, source, id: blockId } = getPythonAttributes(block);
      const actualSource = (metadata.isSuggestion ? aiSuggestions : source)?.toJSON() ?? '';

      let errored = false;
      const { promise, abort } = await executeCode(
        ctx.execution.workspaceId,
        ctx.execution.sessionId,
        actualSource,
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

      await this.updateDataFrames(blockId, ctx);

      block.setAttribute('lastQuery', block.getAttribute('source')!.toJSON());
      block.setAttribute('lastQueryTime', new Date().toISOString());
      executionItem.setCompleted(errored ? 'error' : 'success');
      cleanup();
    } catch (err) {
      this.logger.error({ ...ctx.execution, blockId: block.getAttribute('id'), err }, 'Python execution error');
      executionItem.setCompleted('error');
    }
  }

  private async updateDataFrames(blockId: string, ctx: DocumentContext): Promise<void> {
    const newDataframes = await listDataFrames(ctx.execution.workspaceId, ctx.execution.sessionId);
    const blocks = new Set(Array.from(ctx.blocks.keys()));
    updateDataframes(ctx.dataframes, newDataframes, blockId, blocks);
  }
}