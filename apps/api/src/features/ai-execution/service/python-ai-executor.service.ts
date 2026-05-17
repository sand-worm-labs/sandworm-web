import * as Y from 'yjs';
import { Injectable, Logger } from '@nestjs/common';
import { YjsDocumentService } from '../../collaboration/yjs/yjs-document.service';
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

export interface PythonEditStreamedOptions {
  source: string;
  instructions: string;
  modelId: string;
  onSource: (source: string) => void;
}

@Injectable()
export class PythonAiExecutorService extends BaseAiExecutorService {
  protected readonly logger = new Logger(PythonAiExecutorService.name);

  constructor(yjsDocumentService: YjsDocumentService, persistorFactory: PersistorFactory) {
    super(yjsDocumentService, persistorFactory);
  }

  private async getBlock(documentId: string, workspaceId: string, blockId: string) {
    const sharedDoc = await this.getSharedDoc(documentId, workspaceId);
    const block = getBlocks(sharedDoc.ydoc).get(blockId) as Y.XmlElement<PythonBlock> | undefined;
    if (!block) throw new Error(`Block ${blockId} not found in document ${documentId}`);
    return { sharedDoc, block };
  }

  private enqueue(ydoc: Y.Doc, blockId: string, userId: string | null, tag: 'edit-python' | 'fix-python') {
    const aiTasks = AITasks.fromYjs(ydoc);
    aiTasks.enqueue(blockId, userId, { _tag: tag });
    const taskItem = aiTasks.next();
    if (!taskItem) throw new Error(`Failed to dequeue ${tag} task`);
    return taskItem;
  }

  async editPython(documentId: string, workspaceId: string, blockId: string, userId: string | null, modelId: string): Promise<string> {
    try {
      const { sharedDoc, block } = await this.getBlock(documentId, workspaceId, blockId);
      const taskItem = this.enqueue(sharedDoc.ydoc, blockId, userId, 'edit-python');
      return await this.runEdit(taskItem, block, modelId);
    } catch (err) {
      this.logger.error('editPython failed', err);
      throw err;
    }
  }

  async fixPython(documentId: string, workspaceId: string, blockId: string, userId: string | null, modelId: string): Promise<string> {
    try {
      const { sharedDoc, block } = await this.getBlock(documentId, workspaceId, blockId);
      const taskItem = this.enqueue(sharedDoc.ydoc, blockId, userId, 'fix-python');
      return await this.runFix(taskItem, block, modelId);
    } catch (err) {
      this.logger.error('fixPython failed', err);
      throw err;
    }
  }

  private async runEdit(taskItem: AITaskItem, block: Y.XmlElement<PythonBlock>, modelId: string): Promise<string> {
    let cleanup: () => void = () => {};
    let aborted = false;
    let result = '';
    try {
      cleanup = taskItem.observeStatus(s => { if (s._tag === 'aborting') aborted = true; });

      const instructions = getPythonBlockEditWithAIPrompt(block).toJSON();
      if (!instructions) { taskItem.setCompleted('error'); return result; }

      const source = getPythonSource(block).toJSON();
      await this.simulate({ source, instructions, modelId, onSource: (s) => {
        if (aborted) return;
        result = s;
        updatePythonAISuggestions(block, s);
      }});

      if (aborted) { taskItem.setCompleted('aborted'); return result; }
      closePythonEditWithAIPrompt(block, true);
      taskItem.setCompleted('success');
      return result;
    } catch (err) {
      taskItem.setCompleted('error');
      throw err;
    } finally {
      cleanup();
    }
  }

  private async runFix(taskItem: AITaskItem, block: Y.XmlElement<PythonBlock>, modelId: string): Promise<string> {
    let cleanup: () => void = () => {};
    let aborted = false;
    let result = '';
    try {
      cleanup = taskItem.observeStatus(s => { if (s._tag === 'aborting') aborted = true; });

      const error = getPythonBlockResult(block).find((r): r is PythonErrorOutput => r.type === 'error');
      if (!error) { taskItem.setCompleted('error'); return result; }

      const instructions = `Fix the Python code, this is the error: ${JSON.stringify({ ...error, traceback: error.traceback.slice(0, 2) })}`;
      const source = getPythonSource(block).toJSON();

      await this.simulate({ source, instructions, modelId, onSource: (s) => {
        if (aborted) return;
        result = s;
        updatePythonAISuggestions(block, s);
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

  private async simulate(options: PythonEditStreamedOptions): Promise<string> {
    await new Promise(r => setTimeout(r, 800));
    const generated = `# AI suggestion\n# Instructions: ${options.instructions}\n${options.source}`;
    options.onSource(generated);
    return generated;
  }
}