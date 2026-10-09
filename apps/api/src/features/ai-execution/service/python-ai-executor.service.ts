import * as Y from 'yjs';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { YjsDocumentService } from '../../collaboration/yjs/yjs-document.service';
import { ChatService } from '../../chat/chat.service';
import { PersistorFactory } from '../../collaboration/yjs/persistors/persistor.factory';
import {
  getBlocks,
  AITasks,
  AITaskItem,
  getPythonBlockEditWithAIPrompt,
  getPythonBlockResult,
  getPythonSource,
  closePythonEditWithAIPrompt,
} from '@sandworm/editor';
import type { PythonBlock } from '@sandworm/editor';
import type { PythonErrorOutput } from '@sandworm/types';
import { BaseAiExecutorService } from './base-ai-executor.service';
import { PythonGeneratorService } from '@/infrastructure/ai/services/python-generator.service';
import { GeneratorContext } from '@/infrastructure/ai/types/generator.types';
import { WorkspaceService } from '@/features/workspace/service/workspace.service';

@Injectable()
export class PythonAiExecutorService extends BaseAiExecutorService {
  protected readonly logger = new Logger(PythonAiExecutorService.name);

  constructor(
    yjsDocumentService: YjsDocumentService,
    persistorFactory: PersistorFactory,
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
    private readonly pythonGeneratorService: PythonGeneratorService,
    private readonly workspaceService: WorkspaceService,
  ) {
    super(yjsDocumentService, persistorFactory);
  }

  async editAiPython(
    documentId: string,
    workspaceId: string,
    blockId: string,
    userId: string,
    chatId?: string,
  ): Promise<{ result: string; chatId?: string }> {
    try {
      const sharedDoc = await this.getSharedDoc(documentId, workspaceId);
      const block = getBlocks(sharedDoc.ydoc).get(blockId) as Y.XmlElement<PythonBlock> | undefined;
      if (!block) throw new Error(`Block ${blockId} not found in document ${documentId}`);

      const aiTasks = AITasks.fromYjs(sharedDoc.ydoc);
      aiTasks.enqueue(blockId, userId, { _tag: 'edit-python' });
      const taskItem = aiTasks.next();
      if (!taskItem) throw new Error('Failed to dequeue edit-python task');


      const resolvedChatId = await this.chatService.latestChatId(userId, { workspaceId, documentId, chatId });

      const ctx: GeneratorContext = { user_id: userId, workspace_id: workspaceId, document_id: documentId, chat_id: resolvedChatId };
      const result = await this.runEdit(taskItem, block, ctx);
      return { result, chatId: resolvedChatId };
    } catch (err) {
      this.logger.error('editPython failed', err);
      throw err;
    }
  }

  async fixAiPython(
    documentId: string,
    workspaceId: string,
    blockId: string,
    userId: string,
  ): Promise<{ result: string; chatId?: string }> {
    try {
      const sharedDoc = await this.getSharedDoc(documentId, workspaceId);
      const block = getBlocks(sharedDoc.ydoc).get(blockId) as Y.XmlElement<PythonBlock> | undefined;
      if (!block) throw new Error(`Block ${blockId} not found in document ${documentId}`);

      const aiTasks = AITasks.fromYjs(sharedDoc.ydoc);
      aiTasks.enqueue(blockId, userId, { _tag: 'fix-python' });
      const taskItem = aiTasks.next();
      if (!taskItem) throw new Error('Failed to dequeue fix-python task');


      const chatId = await this.chatService.latestChatId(userId, { workspaceId, documentId });

      const ctx: GeneratorContext = { user_id: userId, workspace_id: workspaceId, document_id: documentId, chat_id: chatId };
      const result = await this.runFix(taskItem, block, ctx);

      return { result, chatId };
    } catch (err) {
      this.logger.error('fixPython failed', err);
      throw err;
    }
  }

  private async runEdit(
    taskItem: AITaskItem,
    block: Y.XmlElement<PythonBlock>,
    ctx: GeneratorContext,
  ): Promise<string> {
    try {
      const instructions = getPythonBlockEditWithAIPrompt(block).toJSON();
      if (!instructions) { taskItem.setCompleted('error'); return ''; }

      const source = getPythonSource(block).toJSON();
      const prompt = `${instructions}\n\n${source}`;

      // The AI service has the MCP server change the cell itself; nothing comes back to apply.
      const finished = await this.runUnlessStopped(taskItem, signal =>
        this.pythonGeneratorService.edit(ctx, block.getAttribute('id') as string, prompt, signal),
      );

      if (!finished) { taskItem.setCompleted('aborted'); return getPythonSource(block).toJSON(); }
      closePythonEditWithAIPrompt(block, true);
      taskItem.setCompleted('success');
      return getPythonSource(block).toJSON();
    } catch (err) {
      taskItem.setCompleted('error');
      throw err;
    }
  }

  private async runFix(
    taskItem: AITaskItem,
    block: Y.XmlElement<PythonBlock>,
    ctx: GeneratorContext,
  ): Promise<string> {
    try {
      const error = getPythonBlockResult(block).find(
        (r): r is PythonErrorOutput => r.type === 'error'
      );
      if (!error) { taskItem.setCompleted('error'); return ''; }

      const source = getPythonSource(block).toJSON();
      const error_message = `Source:\n${source}\n\nError: ${JSON.stringify({
        ...error,
        traceback: error.traceback.slice(0, 2),
      })}`;

      const finished = await this.runUnlessStopped(taskItem, signal =>
        this.pythonGeneratorService.fix(ctx, block.getAttribute('id') as string, error_message, signal),
      );

      if (!finished) { taskItem.setCompleted('aborted'); return getPythonSource(block).toJSON(); }
      taskItem.setCompleted('success');
      return getPythonSource(block).toJSON();
    } catch (err) {
      taskItem.setCompleted('error');
      throw err;
    }
  }
}
