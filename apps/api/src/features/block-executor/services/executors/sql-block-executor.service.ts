import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as Y from 'yjs';
import {
  ExecutionQueueItem,
  ExecutionQueueItemSQLMetadata,
  SQLBlock,
  getSQLAttributes,
} from '@sandworm/editor';
import { exhaustiveCheck, RunQueryResult } from '@sandworm/types';
import { DocumentContext } from '../../interfaces';
import { DataFrameService } from '@/features/code-execution/query-engine/dataframe/dataframe.service';
import { QueryExecutionService } from '@/features/code-execution/query-engine/query-execution.service';
import { VARIABLE_NAME_REGEX } from '@/features/code-execution/utils';


@Injectable()
export class SqlBlockExecutorService {
  private readonly logger = new Logger(SqlBlockExecutorService.name);

  constructor(private readonly eventEmitter: EventEmitter2) { }

  async run(
    executionItem: ExecutionQueueItem,
    block: Y.XmlElement<SQLBlock>,
    ctx: DocumentContext,
    metadata: ExecutionQueueItemSQLMetadata,
  ): Promise<void> {
    this.eventEmitter.emit('sql.run', { ...ctx.execution, blockId: block.getAttribute('id') });

    try {
      block.setAttribute('startQueryTime', new Date().toISOString());

      let aborted = false;
      let cleanup = executionItem.observeStatus((status) => {
        if (status._tag === 'aborting') aborted = true;
      });

      const {
        id: blockId,
        aiSuggestions,
        source,
        configuration,
        dataframeName,
      } = getSQLAttributes(block, ctx.blocks);

      if (!dataframeName) {
        executionItem.setCompleted('error');
        cleanup();
        return;
      }

      if (aborted) {
        executionItem.setCompleted('aborted');
        block.setAttribute('result', { type: 'abort-error', message: 'Query aborted' });
        cleanup();
        return;
      }

      block.setAttribute('result', null);
      block.setAttribute('page', 0);
      block.setAttribute('sort', null);

      let actualSource = (metadata.isSuggestion ? aiSuggestions : source)?.toJSON().trim() ?? '';
      if (metadata.selectedCode) {
        actualSource = metadata.selectedCode;
      }

      let resultType: RunQueryResult['type'] | 'empty-query' = 'empty-query';

      if (actualSource !== '') {
        const [promise, abort] = await makeSQLQuery(
          ctx.execution.workspaceId,
          ctx.execution.sessionId,
          blockId,
          dataframeName.value,
          'duckdb',
          actualSource,
          { pageSize: 50 },
          (result) => block.setAttribute('result', result),
          configuration,
        );
        cleanup();

        if (aborted) {
          executionItem.setCompleted('aborted');
          await abort();
          await promise;
          block.setAttribute('result', { type: 'abort-error', message: 'Query aborted' });
          return;
        }

        let abortP = Promise.resolve(false);
        cleanup = executionItem.observeStatus((status) => {
          if (status._tag === 'aborting') {
            abortP = abort().then(() => true);
          }
        });

        const result = await promise;
        aborted = await abortP;
        cleanup();

        if (aborted) {
          executionItem.setCompleted('aborted');
          block.setAttribute('result', { type: 'abort-error', message: 'Query aborted' });
          return;
        }

        block.setAttribute('lastQuery', actualSource);
        block.setAttribute('lastQueryTime', new Date().toISOString());

        if (result.type === 'python-error') {
          this.logger.error(
            { ...ctx.execution, blockId, err: result },
            'Python error while running SQL query',
          );
          block.setAttribute('result', { ...result, traceback: [] });
        } else {
          block.setAttribute('result', result);
        }

        if (result.type === 'success') {
          ctx.dataframes.set(dataframeName.value, {
            id: blockId,
            name: dataframeName.value,
            columns: result.columns,
            blockId,
            updatedAt: new Date().toISOString(),
          });
        } else if (result.type === 'syntax-error') {
          this.logger.warn(
            { ...ctx.execution, blockId, err: result },
            'Syntax error while running SQL query',
          );
        }

        resultType = result.type;
      }

      executionItem.setCompleted(
        resultType === 'success'
          ? 'success'
          : resultType === 'abort-error'
            ? 'aborted'
            : 'error',
      );
    } catch (err) {
      this.logger.error(
        { ...ctx.execution, blockId: block.getAttribute('id'), err },
        'SQL execution error',
      );
      executionItem.setCompleted('error');
    }
  }

  async loadPage(
    executionItem: ExecutionQueueItem,
    block: Y.XmlElement<SQLBlock>,
    ctx: DocumentContext,
  ): Promise<void> {
    try {
      const attrs = getSQLAttributes(block, ctx.blocks);
      const prevResult = attrs.result?.type === 'success' ? attrs.result : null;
      const queryDurationMs = prevResult?.queryDurationMs;

      const nextResult = await readDataframePage(
        ctx.execution.workspaceId,
        ctx.execution.sessionId,
        attrs.id,
        attrs.dataframeName.value,
        { page: attrs.page, pageSize: 50 },
        attrs.sort,
      );

      switch (nextResult.type) {
        case 'success':
          block.setAttribute('result', { ...nextResult, queryDurationMs });
          executionItem.setCompleted('success');
          break;
        case 'abort-error':
          block.setAttribute('result', nextResult);
          executionItem.setCompleted('aborted');
          break;
        case 'syntax-error':
        case 'python-error':
          block.setAttribute('result', nextResult);
          executionItem.setCompleted('error');
          break;
        default:
          exhaustiveCheck(nextResult);
      }
    } catch (err) {
      this.logger.error(
        { ...ctx.execution, blockId: block.getAttribute('id'), err },
        'Load page error',
      );
      executionItem.setCompleted('error');
    }
  }

  async renameDataframe(
    executionItem: ExecutionQueueItem,
    block: Y.XmlElement<SQLBlock>,
    ctx: DocumentContext,
  ): Promise<void> {
    const { id: blockId, dataframeName, result } = getSQLAttributes(block, ctx.blocks);

    if (!VARIABLE_NAME_REGEX.test(dataframeName.newValue)) {
      block.setAttribute('dataframeName', { ...dataframeName, error: 'invalid-name' });
      executionItem.setCompleted('error');
      return;
    }

    if (result?.type !== 'success') {
      block.setAttribute('dataframeName', { ...dataframeName, value: dataframeName.newValue });
      executionItem.setCompleted(result?.type === 'abort-error' ? 'aborted' : 'error');
      return;
    }

    try {
      await renameDataFrame(
        ctx.execution.workspaceId,
        ctx.execution.sessionId,
        dataframeName.value,
        dataframeName.newValue,
      );

      const dataframes = await listDataFrames(ctx.execution.workspaceId, ctx.execution.sessionId);
      const blocks = new Set(Array.from(ctx.blocks.keys()));
      updateDataframes(ctx.dataframes, dataframes, blockId, blocks);

      block.setAttribute('dataframeName', {
        ...dataframeName,
        value: dataframeName.newValue,
        error: undefined,
      });
      executionItem.setCompleted('success');
    } catch (err) {
      this.logger.error({ ...ctx.execution, blockId, err }, 'Rename dataframe error');
      executionItem.setCompleted('error');
    }
  }
}