import * as Y from 'yjs';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { YjsDocumentService } from '../../collaboration/yjs/yjs-document.service';
import { PersistorFactory } from '../../collaboration/yjs/persistors/persistor.factory';
import { ChatService } from '../../chat/chat.service';
import {
  getBlocks,
  AITasks,
  AITaskItem,
  getSQLAttributes,
  closeSQLEditWithAIPrompt,
} from '@sandworm/editor';
import type { SQLBlock } from '@sandworm/editor';
import { DATA_SOURCE_DIALECT, DataSourceId } from '@sandworm/types';
import { BaseAiExecutorService } from './base-ai-executor.service';
import { SqlGeneratorService } from '@/infrastructure/ai/services/sql-generator.service';
import { GeneratorContext } from '@/infrastructure/ai/types/generator.types';
import { WorkspaceService } from '@/features/workspace/service/workspace.service';

@Injectable()
export class SqlAiExecutorService extends BaseAiExecutorService {
  protected readonly logger = new Logger(SqlAiExecutorService.name);

  constructor(
    yjsDocumentService: YjsDocumentService,
    persistorFactory: PersistorFactory,
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
    private readonly sqlGeneratorService: SqlGeneratorService,
    private readonly workspaceService: WorkspaceService,
  ) {
    super(yjsDocumentService, persistorFactory);
  }

  async editAiSql(
    documentId: string,
    workspaceId: string,
    blockId: string,
    userId: string,
    chatId?: string,
  ): Promise<{ result: string; chatId?: string }> {
    try {
      const sharedDoc = await this.getSharedDoc(documentId, workspaceId);
      const block = getBlocks(sharedDoc.ydoc).get(blockId) as Y.XmlElement<SQLBlock> | undefined;
      if (!block) throw new Error(`Block ${blockId} not found in document ${documentId}`);

      const aiTasks = AITasks.fromYjs(sharedDoc.ydoc);
      aiTasks.enqueue(blockId, userId, { _tag: 'edit-sql' });
      const taskItem = aiTasks.next();
      if (!taskItem) throw new Error('Failed to dequeue edit-sql task');


      const resolvedChatId = await this.chatService.latestChatId(userId, { workspaceId, documentId, chatId });

      const ctx: GeneratorContext = { user_id: userId, workspace_id: workspaceId, document_id: documentId, chat_id: resolvedChatId };
      const result = await this.runAiEdit(taskItem, block, sharedDoc.ydoc, ctx);
      return { result, chatId: resolvedChatId };
    } catch (err) {
      this.logger.error('editSql failed', err);
      throw err;
    }
  }

  async fixAiSql(
    documentId: string,
    workspaceId: string,
    blockId: string,
    userId: string,
  ): Promise<{ result: string; chatId?: string }> {
    try {
      const sharedDoc = await this.getSharedDoc(documentId, workspaceId);
      const block = getBlocks(sharedDoc.ydoc).get(blockId) as Y.XmlElement<SQLBlock> | undefined;
      if (!block) throw new Error(`Block ${blockId} not found in document ${documentId}`);

      const aiTasks = AITasks.fromYjs(sharedDoc.ydoc);
      aiTasks.enqueue(blockId, userId, { _tag: 'fix-sql' });
      const taskItem = aiTasks.next();
      if (!taskItem) throw new Error('Failed to dequeue fix-sql task');

      const ctx: GeneratorContext = { user_id: userId, workspace_id: workspaceId, document_id: documentId };

      const chatId = await this.chatService.latestChatId(userId, { workspaceId, documentId });

      const result = await this.runAiFix(taskItem, block, sharedDoc.ydoc, { ...ctx, chat_id: chatId });

      return { result, chatId };
    } catch (err) {
      this.logger.error('fixSql failed', err);
      throw err;
    }
  }

  private async runAiEdit(
    taskItem: AITaskItem,
    block: Y.XmlElement<SQLBlock>,
    ydoc: Y.Doc,
    ctx: GeneratorContext,
  ): Promise<string> {
    try {
      const { source, dataSourceId, editWithAIPrompt } = getSQLAttributes(block, getBlocks(ydoc));
      const instructions = editWithAIPrompt?.toJSON() ?? '';
      if (!instructions) { taskItem.setCompleted('error'); return ''; }

      const query = source?.toJSON() ?? '';
      const dialect = DATA_SOURCE_DIALECT[dataSourceId as DataSourceId] ?? 'duckdb';
      const prompt = `Dialect: ${dialect}\n\nQuery:\n${query}\n\nInstructions: ${instructions}`;

      // The AI service has the MCP server change the cell itself; nothing comes back to apply.
      const finished = await this.runUnlessStopped(taskItem, signal =>
        this.sqlGeneratorService.edit(ctx, block.getAttribute('id') as string, prompt, signal),
      );

      if (!finished) { taskItem.setCompleted('aborted'); return source?.toJSON() ?? ''; }
      closeSQLEditWithAIPrompt(block, true);
      taskItem.setCompleted('success');
      return source?.toJSON() ?? '';
    } catch (err) {
      taskItem.setCompleted('error');
      throw err;
    }
  }

  private async runAiFix(
    taskItem: AITaskItem,
    block: Y.XmlElement<SQLBlock>,
    ydoc: Y.Doc,
    ctx: GeneratorContext,
  ): Promise<string> {
    try {
      const { source, dataSourceId, result: blockResult } = getSQLAttributes(block, getBlocks(ydoc));
      if (!blockResult || blockResult.type !== 'syntax-error') {
        taskItem.setCompleted('error');
        return '';
      }

      const query = source?.toJSON() ?? '';
      const dialect = DATA_SOURCE_DIALECT[dataSourceId as DataSourceId] ?? 'duckdb';
      const error_message = `Dialect: ${dialect}\n\nQuery:\n${query}\n\nError: ${blockResult.message}`;

      const finished = await this.runUnlessStopped(taskItem, signal =>
        this.sqlGeneratorService.fix(ctx, block.getAttribute('id') as string, error_message, signal),
      );

      if (!finished) { taskItem.setCompleted('aborted'); return source?.toJSON() ?? ''; }
      taskItem.setCompleted('success');
      return source?.toJSON() ?? '';
    } catch (err) {
      taskItem.setCompleted('error');
      throw err;
    }
  }
}
