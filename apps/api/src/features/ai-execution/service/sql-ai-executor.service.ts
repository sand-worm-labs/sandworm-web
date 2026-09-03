import * as Y from 'yjs';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
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
    eventEmitter: EventEmitter2,
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
    private readonly sqlGeneratorService: SqlGeneratorService,
    private readonly workspaceService: WorkspaceService,
  ) {
    super(yjsDocumentService, persistorFactory, eventEmitter);
  }

  async editAiSql(
    documentId: string,
    workspaceId: string,
    blockId: string,
    userId: string,
    chatId?: string,
  ): Promise<{ result: string; chatId: string }> {
    try {
      const sharedDoc = await this.getSharedDoc(documentId, workspaceId);
      const block = getBlocks(sharedDoc.ydoc).get(blockId) as Y.XmlElement<SQLBlock> | undefined;
      if (!block) throw new Error(`Block ${blockId} not found in document ${documentId}`);

      const aiTasks = AITasks.fromYjs(sharedDoc.ydoc);
      aiTasks.enqueue(blockId, userId, { _tag: 'edit-sql' });
      const taskItem = aiTasks.next();
      if (!taskItem) throw new Error('Failed to dequeue edit-sql task');

      const workspace = await this.workspaceService.getWorkspaceById(workspaceId);
      const focusedBlocks = [{ id: blockId, title: block.getAttribute('title') ?? '', type: 'SQL' }];

      let resolvedChatId = chatId;
      if (resolvedChatId) {
        await this.chatService.sendMessage(userId, {
          chatId: resolvedChatId,
          content: `Edited SQL block with AI`,
          model: workspace.assistantModel,
          focusedBlocks,
        });
      } else {
        const chat = await this.chatService.createChat(userId, {
          workspaceId,
          documentId,
          message: `Edited SQL block with AI`,
          model: workspace.assistantModel,
          title: 'SQL Edit',
          updateDocumentTitle: false,
          focusedBlocks,
        });
        resolvedChatId = chat.id;
      }

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
  ): Promise<{ result: string; chatId: string }> {
    try {
      const sharedDoc = await this.getSharedDoc(documentId, workspaceId);
      const block = getBlocks(sharedDoc.ydoc).get(blockId) as Y.XmlElement<SQLBlock> | undefined;
      if (!block) throw new Error(`Block ${blockId} not found in document ${documentId}`);

      const aiTasks = AITasks.fromYjs(sharedDoc.ydoc);
      aiTasks.enqueue(blockId, userId, { _tag: 'fix-sql' });
      const taskItem = aiTasks.next();
      if (!taskItem) throw new Error('Failed to dequeue fix-sql task');

      const ctx: GeneratorContext = { user_id: userId, workspace_id: workspaceId, document_id: documentId };
      const workspace = await this.workspaceService.getWorkspaceById(workspaceId);

      const chat = await this.chatService.createChat(userId, {
        workspaceId,
        documentId,
        message: `Fixed SQL block — here's what changed:\n\`\`\`sql\n\n\`\`\``,
        model: workspace.assistantModel,
        title: 'SQL Fix',
        updateDocumentTitle: false,
      });

      const result = await this.runAiFix(taskItem, block, sharedDoc.ydoc, { ...ctx, chat_id: chat.id });

      return { result, chatId: chat.id };
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
    let cleanup: () => void = () => {};
    let aborted = false;
    try {
      cleanup = taskItem.observeStatus(s => { if (s._tag === 'aborting') aborted = true; });
      const { source, dataSourceId, editWithAIPrompt } = getSQLAttributes(block, getBlocks(ydoc));
      const instructions = editWithAIPrompt?.toJSON() ?? '';
      if (!instructions) { taskItem.setCompleted('error'); return ''; }

      const query = source?.toJSON() ?? '';
      const dialect = DATA_SOURCE_DIALECT[dataSourceId as DataSourceId] ?? 'duckdb';
      const prompt = `Dialect: ${dialect}\n\nQuery:\n${query}\n\nInstructions: ${instructions}`;

      const { code } = await this.sqlGeneratorService.edit(ctx, prompt);

      if (aborted) { taskItem.setCompleted('aborted'); return code; }
      updateSQLAISuggestions(block, code);
      closeSQLEditWithAIPrompt(block, true);
      taskItem.setCompleted('success');
      this.emitBlockAction('edited', 'SQL', block, ctx);
      return code;
    } catch (err) {
      taskItem.setCompleted('error');
      throw err;
    } finally {
      cleanup();
    }
  }

  private async runAiFix(
    taskItem: AITaskItem,
    block: Y.XmlElement<SQLBlock>,
    ydoc: Y.Doc,
    ctx: GeneratorContext,
  ): Promise<string> {
    let cleanup: () => void = () => {};
    let aborted = false;
    try {
      cleanup = taskItem.observeStatus(s => { if (s._tag === 'aborting') aborted = true; });

      this.emitBlockAction('created', 'SQL', block, ctx);

      const { source, dataSourceId, result: blockResult } = getSQLAttributes(block, getBlocks(ydoc));
      if (!blockResult || blockResult.type !== 'syntax-error') {
        taskItem.setCompleted('error');
        return '';
      }

      const query = source?.toJSON() ?? '';
      const dialect = DATA_SOURCE_DIALECT[dataSourceId as DataSourceId] ?? 'duckdb';
      const error_message = `Dialect: ${dialect}\n\nQuery:\n${query}\n\nError: ${blockResult.message}`;

      const { code } = await this.sqlGeneratorService.fix(ctx, error_message);

      if (aborted) { taskItem.setCompleted('aborted'); return code; }
      updateSQLAISuggestions(block, code);
      taskItem.setCompleted('success');
      this.emitBlockAction('edited', 'SQL', block, ctx);
      return code;
    } catch (err) {
      taskItem.setCompleted('error');
      throw err;
    } finally {
      cleanup();
    }
  }
}
