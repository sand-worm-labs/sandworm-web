import * as Y from 'yjs';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { YjsDocumentService } from '../../collaboration/yjs/yjs-document.service';
import { ChatService } from '../../chat/chat.service';
import { PersistorFactory } from '../../collaboration/yjs/persistors/persistor.factory';
import {
  getBlocks,
  AITasks,
  AITaskItem,
  updatePythonAISuggestions,
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
    eventEmitter: EventEmitter2,
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
    private readonly pythonGeneratorService: PythonGeneratorService,
    private readonly workspaceService: WorkspaceService,
  ) {
    super(yjsDocumentService, persistorFactory, eventEmitter);
  }

  async editAiPython(
    documentId: string,
    workspaceId: string,
    blockId: string,
    userId: string,
  ): Promise<{ result: string; chatId: string }> {
    try {
      const sharedDoc = await this.getSharedDoc(documentId, workspaceId);
      const block = getBlocks(sharedDoc.ydoc).get(blockId) as Y.XmlElement<PythonBlock> | undefined;
      if (!block) throw new Error(`Block ${blockId} not found in document ${documentId}`);

      const aiTasks = AITasks.fromYjs(sharedDoc.ydoc);
      aiTasks.enqueue(blockId, userId, { _tag: 'edit-python' });
      const taskItem = aiTasks.next();
      if (!taskItem) throw new Error('Failed to dequeue edit-python task');

      const workspace = await this.workspaceService.getWorkspaceById(workspaceId);
      const chat = await this.chatService.createChat(userId, {
        workspaceId,
        documentId,
        message: `Edited Python block with AI`,
        model: workspace.assistantModel,
        title: 'Python Edit',
        updateDocumentTitle: false,
      });

      const ctx: GeneratorContext = { user_id: userId, workspace_id: workspaceId, document_id: documentId, chat_id: chat.id };
      const result = await this.runEdit(taskItem, block, ctx);
      return { result, chatId: chat.id };
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
  ): Promise<{ result: string; chatId: string }> {
    try {
      const sharedDoc = await this.getSharedDoc(documentId, workspaceId);
      const block = getBlocks(sharedDoc.ydoc).get(blockId) as Y.XmlElement<PythonBlock> | undefined;
      if (!block) throw new Error(`Block ${blockId} not found in document ${documentId}`);

      const aiTasks = AITasks.fromYjs(sharedDoc.ydoc);
      aiTasks.enqueue(blockId, userId, { _tag: 'fix-python' });
      const taskItem = aiTasks.next();
      if (!taskItem) throw new Error('Failed to dequeue fix-python task');

      const workspace = await this.workspaceService.getWorkspaceById(workspaceId);

      const chat = await this.chatService.createChat(userId, {
        workspaceId,
        documentId,
        message: `Fixed Python block — here's what changed:\n\`\`\`python\n\n\`\`\``,
        model: workspace.assistantModel,
        title: 'Python Fix',
        updateDocumentTitle: false,
      });

      const ctx: GeneratorContext = { user_id: userId, workspace_id: workspaceId, document_id: documentId, chat_id: chat.id };
      const result = await this.runFix(taskItem, block, ctx);

      return { result, chatId: chat.id };
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
    let cleanup: () => void = () => {};
    let aborted = false;
    try {
      cleanup = taskItem.observeStatus(s => { if (s._tag === 'aborting') aborted = true; });

      const instructions = getPythonBlockEditWithAIPrompt(block).toJSON();
      if (!instructions) { taskItem.setCompleted('error'); return ''; }

      const source = getPythonSource(block).toJSON();
      const prompt = `${instructions}\n\n${source}`;

      const { code } = await this.pythonGeneratorService.edit(ctx, prompt);

      if (aborted) { taskItem.setCompleted('aborted'); return code; }
      updatePythonAISuggestions(block, code);
      closePythonEditWithAIPrompt(block, true);
      taskItem.setCompleted('success');
      this.emitBlockAction('edited', 'Python', block, ctx);
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
    block: Y.XmlElement<PythonBlock>,
    ctx: GeneratorContext,
  ): Promise<string> {
    let cleanup: () => void = () => {};
    let aborted = false;
    try {
      cleanup = taskItem.observeStatus(s => { if (s._tag === 'aborting') aborted = true; });
      const error = getPythonBlockResult(block).find(
        (r): r is PythonErrorOutput => r.type === 'error'
      );
      if (!error) { taskItem.setCompleted('error'); return ''; }

      const source = getPythonSource(block).toJSON();
      const error_message = `Source:\n${source}\n\nError: ${JSON.stringify({
        ...error,
        traceback: error.traceback.slice(0, 2),
      })}`;

      const { code } = await this.pythonGeneratorService.fix(ctx, error_message);

      if (aborted) { taskItem.setCompleted('aborted'); return code; }
      updatePythonAISuggestions(block, code);
      taskItem.setCompleted('success');
      this.emitBlockAction('edited', 'Python', block, ctx);
      return code;
    } catch (err) {
      taskItem.setCompleted('error');
      throw err;
    } finally {
      cleanup();
    }
  }
}
