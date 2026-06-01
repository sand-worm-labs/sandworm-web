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

  async editSql(
    documentId: string,
    workspaceId: string,
    blockId: string,
    userId: string | null,
  ): Promise<string> {
    try {
      const sharedDoc = await this.getSharedDoc(documentId, workspaceId);
      const block = getBlocks(sharedDoc.ydoc).get(blockId) as Y.XmlElement<SQLBlock> | undefined;
      if (!block) throw new Error(`Block ${blockId} not found in document ${documentId}`);

      const aiTasks = AITasks.fromYjs(sharedDoc.ydoc);
      aiTasks.enqueue(blockId, userId, { _tag: 'edit-sql' });
      const taskItem = aiTasks.next();
      if (!taskItem) throw new Error('Failed to dequeue edit-sql task');

      const ctx: GeneratorContext = { user_id: userId, workspace_id: workspaceId, document_id: documentId };
      return await this.runEdit(taskItem, block, sharedDoc.ydoc, ctx);
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

      const result = await this.runFix(taskItem, block, sharedDoc.ydoc, ctx);

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
      const dialect = dataSourceId ? 'sql' : 'duckdb';
      const prompt = `Dialect: ${dialect}\n\nQuery:\n${query}\n\nInstructions: ${instructions}`;

      const { code } = await this.sqlGeneratorService.edit(ctx, prompt);

      if (aborted) { taskItem.setCompleted('aborted'); return code; }
      updateSQLAISuggestions(block, code);
      closeSQLEditWithAIPrompt(block, true);
      taskItem.setCompleted('success');
      return code;
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
    ctx: GeneratorContext,
  ): Promise<string> {
    let cleanup: () => void = () => {};
    let aborted = false;
    try {
      cleanup = taskItem.observeStatus(s => { if (s._tag === 'aborting') aborted = true; });

      const { source, dataSourceId, result: blockResult } = getSQLAttributes(block, getBlocks(ydoc));
      if (!blockResult || blockResult.type !== 'syntax-error') {
        taskItem.setCompleted('error');
        return '';
      }

      const query = source?.toJSON() ?? '';
      const dialect = dataSourceId ? 'sql' : 'duckdb';
      const error_message = `Dialect: ${dialect}\n\nQuery:\n${query}\n\nError: ${blockResult.message}`;

      const { code } = await this.sqlGeneratorService.fix(ctx, error_message);

      if (aborted) { taskItem.setCompleted('aborted'); return code; }
      updateSQLAISuggestions(block, code);
      taskItem.setCompleted('success');
      return code;
    } catch (err) {
      taskItem.setCompleted('error');
      throw err;
    } finally {
      cleanup();
    }
  }
}
