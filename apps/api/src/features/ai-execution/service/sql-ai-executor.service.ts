import * as Y from 'yjs';
import { Injectable, Logger } from '@nestjs/common';
import { YjsDocumentService } from '../../collaboration/yjs/yjs-document.service';
import { PersistorFactory } from '../../collaboration/yjs/persistors/persistor.factory';
import { getBlocks, AITasks, AITaskItem,  updateSQLAISuggestions } from '@sandworm/editor';
import type { SQLBlock } from '@sandworm/editor';
import { BaseAiExecutorService } from './base-ai-executor.service';

export interface SqlEditStreamedOptions {
  query: string;
  instructions: string;
  dialect: string;
  modelId: string;
  onSQL: (sql: string) => void;
}

@Injectable()
export class SqlAiExecutorService extends BaseAiExecutorService {
  protected readonly logger = new Logger(SqlAiExecutorService.name);

  constructor(
    yjsDocumentService: YjsDocumentService,
    persistorFactory: PersistorFactory,
  ) {
    super(yjsDocumentService, persistorFactory);
  }

  async enqueueEditSql(
    documentId: string,
    workspaceId: string,
    blockId: string,
    userId: string | null,
  ): Promise<void> {
    const sharedDoc = await this.getSharedDoc(documentId, workspaceId);
    const aiTasks = AITasks.fromYjs(sharedDoc.ydoc);
    aiTasks.enqueue(blockId, userId, { _tag: 'edit-sql' });
  }

  async editSql(
    documentId: string,
    workspaceId: string,
    blockId: string,
    userId: string | null,
    options: Omit<SqlEditStreamedOptions, 'onSQL'>,
  ): Promise<string> {
    try {
      const sharedDoc = await this.getSharedDoc(documentId, workspaceId);
      const ydoc = sharedDoc.ydoc;

      const liveBlocks = getBlocks(ydoc);
      const block = liveBlocks.get(blockId) as Y.XmlElement<SQLBlock> | undefined;
      if (!block) {
        throw new Error(`Block ${blockId} not found in document ${documentId}`);
      }

      const aiTasks = AITasks.fromYjs(ydoc);
      aiTasks.enqueue(blockId, userId, { _tag: 'edit-sql' });

      const taskItem = aiTasks.next();
      if (!taskItem) {
        throw new Error('Failed to dequeue edit-sql task');
      }

      return await this.runEditSql(taskItem, block, options);
    } catch (err) {
      this.logger.error('editSql failed', err);
      throw err;
    }
  }
  async runEditSql(
    taskItem: AITaskItem,
    block: Y.XmlElement<SQLBlock>,
    options: Omit<SqlEditStreamedOptions, 'onSQL'>,
  ): Promise<string> {
    let cleanup: () => void = () => {};
    let aborted = false;
    let generatedSQL = '';

    try {
      cleanup = taskItem.observeStatus((status) => {
        if (status._tag === 'aborting') {
          aborted = true;
        }
      });

      await this.simulateSqlEdit({
        ...options,
        onSQL: (sql) => {
          if (aborted) return;
          generatedSQL = sql;
          updateSQLAISuggestions(block, sql);
        },
      });

      if (aborted) {
        taskItem.setCompleted('aborted');
        return generatedSQL;
      }

      taskItem.setCompleted('success');
      return generatedSQL;
    } catch (err) {
      this.logger.error('runEditSql failed', err);
      taskItem.setCompleted('error');
      throw err;
    } finally {
      cleanup();
    }
  }


  private async simulateSqlEdit(options: SqlEditStreamedOptions): Promise<string> {
    await new Promise(r => setTimeout(r, 800));
    const generated = `-- AI suggestion (${options.dialect})\n-- Instructions: ${options.instructions}\n${options.query}`;
    options.onSQL(generated);
    return generated;
  }
}