import * as Y from 'yjs';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { YjsDocumentService } from '../../collaboration/yjs/yjs-document.service';
import { PersistorFactory } from '../../collaboration/yjs/persistors/persistor.factory';
import { ChatService } from '../../chat/chat.service';
import {
  getBlocks,
  AITasks,
  AITaskItem,
  updateSQLAISuggestions,
  getSQLAttributes,
  closeSQLEditWithAIPrompt,
} from '@sandworm/editor';
import type { SQLBlock } from '@sandworm/editor';
import { BaseAiExecutorService } from './base-ai-executor.service';

export interface SqlEditStreamedOptions {
  query: string;
  dialect: string;
  instructions: string;
  modelId: string;
  onSQL: (sql: string) => void;
}

@Injectable()
export class SqlAiExecutorService extends BaseAiExecutorService {
  protected readonly logger = new Logger(SqlAiExecutorService.name);

  constructor(
    yjsDocumentService: YjsDocumentService,
    persistorFactory: PersistorFactory,
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
  ) {
    super(yjsDocumentService, persistorFactory);
  }

  async editSql(
    documentId: string,
    workspaceId: string,
    blockId: string,
    userId: string | null,
    modelId: string,
  ): Promise<string> {
    try {
      const sharedDoc = await this.getSharedDoc(documentId, workspaceId);
      const block = getBlocks(sharedDoc.ydoc).get(blockId) as Y.XmlElement<SQLBlock> | undefined;
      if (!block) throw new Error(`Block ${blockId} not found in document ${documentId}`);

      const aiTasks = AITasks.fromYjs(sharedDoc.ydoc);
      aiTasks.enqueue(blockId, userId, { _tag: 'edit-sql' });
      const taskItem = aiTasks.next();
      if (!taskItem) throw new Error('Failed to dequeue edit-sql task');

      return await this.runEdit(taskItem, block, sharedDoc.ydoc, modelId);
    } catch (err) {
      this.logger.error('editSql failed', err);
      throw err;
    }
  }

  async fixSql(
    documentId: string,
    workspaceId: string,
    blockId: string,
    userId: string,
    modelId: string,
  ): Promise<{ result: string; chatId: string }> {
    try {
      const sharedDoc = await this.getSharedDoc(documentId, workspaceId);
      const block = getBlocks(sharedDoc.ydoc).get(blockId) as Y.XmlElement<SQLBlock> | undefined;
      if (!block) throw new Error(`Block ${blockId} not found in document ${documentId}`);

      const aiTasks = AITasks.fromYjs(sharedDoc.ydoc);
      aiTasks.enqueue(blockId, userId, { _tag: 'fix-sql' });
      const taskItem = aiTasks.next();
      if (!taskItem) throw new Error('Failed to dequeue fix-sql task');

      const chat = await this.chatService.createChat(userId, {
        workspaceId,
        documentId,
        message: `Fixed SQL block — here's what changed:\n\`\`\`sql\n\n\`\`\``,
        model: modelId,
        title: 'SQL Fix',
        updateDocumentTitle: false,
      });

      const result = await this.runFix(taskItem, block, sharedDoc.ydoc, modelId);

      return { result, chatId: chat.id };
    } catch (err) {
      this.logger.error('fixSql failed', err);
      throw err;
    }
  }

  private async runEdit(
    taskItem: AITaskItem,
    block: Y.XmlElement<SQLBlock>,
    ydoc: Y.Doc,
    modelId: string,
  ): Promise<string> {
    let cleanup: () => void = () => {};
    let aborted = false;
    let result = '';
    try {
      cleanup = taskItem.observeStatus(s => { if (s._tag === 'aborting') aborted = true; });

      const { source, dataSourceId, editWithAIPrompt } = getSQLAttributes(block, getBlocks(ydoc));
      const instructions = editWithAIPrompt?.toJSON() ?? '';
      if (!instructions) { taskItem.setCompleted('error'); return result; }

      const query = source?.toJSON() ?? '';
      const dialect = dataSourceId ? 'sql' : 'duckdb';

      await this.simulate({ query, dialect, instructions, modelId, onSQL: (sql) => {
        if (aborted) return;
        result = sql;
        updateSQLAISuggestions(block, sql);
      }});

      if (aborted) { taskItem.setCompleted('aborted'); return result; }
      closeSQLEditWithAIPrompt(block, true);
      taskItem.setCompleted('success');
      return result;
    } catch (err) {
      taskItem.setCompleted('error');
      throw err;
    } finally {
      cleanup();
    }
  }

  private async runFix(
    taskItem: AITaskItem,
    block: Y.XmlElement<SQLBlock>,
    ydoc: Y.Doc,
    modelId: string,
  ): Promise<string> {
    let cleanup: () => void = () => {};
    let aborted = false;
    let result = '';
    try {
      cleanup = taskItem.observeStatus(s => { if (s._tag === 'aborting') aborted = true; });

      const { source, dataSourceId, result: blockResult } = getSQLAttributes(block, getBlocks(ydoc));
      if (!blockResult || blockResult.type !== 'syntax-error') {
        taskItem.setCompleted('error');
        return result;
      }

      const instructions = `Fix the SQL query, this is the error: ${blockResult.message}`;
      const query = source?.toJSON() ?? '';
      const dialect = dataSourceId ? 'sql' : 'duckdb';

      await this.simulate({ query, dialect, instructions, modelId, onSQL: (sql) => {
        if (aborted) return;
        result = sql;
        updateSQLAISuggestions(block, sql);
      }});

      if (aborted) { taskItem.setCompleted('aborted'); return result; }
      taskItem.setCompleted('success');
      return result;
    } catch (err) {
      taskItem.setCompleted('error');
      throw err;
    } finally {
      cleanup();
    }
  }

  private async simulate(options: SqlEditStreamedOptions): Promise<string> {
    await new Promise(r => setTimeout(r, 800));
    const generated = `-- AI suggestion (${options.dialect})\n-- Instructions: ${options.instructions}\n`;
    options.onSQL(generated);
    return generated;
  }
}