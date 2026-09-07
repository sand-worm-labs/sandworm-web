// ChatService and WorkspaceService transitively drag in the Jupyter/
// code-execution stack and an ESM-only SDK; YjsDocumentService transitively
// drags in DocumentExecutorService -> the visualization block executor ->
// another ESM-only dependency. Stub all three via explicit factories so
// jest never loads the real module chains.
jest.mock('@/features/chat/chat.service', () => ({
  ChatService: jest.fn(),
}));
jest.mock('@/features/workspace/service/workspace.service', () => ({
  WorkspaceService: jest.fn(),
}));
jest.mock('@/features/collaboration/yjs/yjs-document.service', () => ({
  YjsDocumentService: jest.fn(),
}));

import * as Y from 'yjs';
import { AITasks, getBlocks, getPythonAISuggestions, getPythonBlockEditWithAIPrompt, makePythonBlock } from '@sandworm/editor';
import { PythonAiExecutorService } from '../python-ai-executor.service';

function makeService(ydoc: Y.Doc) {
  const yjsDocumentService = {
    getDocId: jest.fn(() => 'doc-1-null'),
    getYDocForUpdateAsync: jest.fn().mockResolvedValue({ ydoc }),
  } as any;
  const persistorFactory = { createDocumentPersistor: jest.fn() } as any;
  const eventEmitter = { emit: jest.fn() } as any;
  const chatService = {
    sendMessage: jest.fn().mockResolvedValue(undefined),
    createChat: jest.fn().mockResolvedValue({ id: 'chat-new' }),
  } as any;
  const pythonGeneratorService = {
    edit: jest.fn().mockResolvedValue({ code: 'print(1)' }),
    fix: jest.fn().mockResolvedValue({ code: 'print(2)' }),
  } as any;
  const workspaceService = {
    getWorkspaceById: jest.fn().mockResolvedValue({ id: 'ws-1', assistantModel: 'gpt' }),
  } as any;

  const service = new PythonAiExecutorService(
    yjsDocumentService,
    persistorFactory,
    eventEmitter,
    chatService,
    pythonGeneratorService,
    workspaceService,
  );

  return { service, yjsDocumentService, eventEmitter, chatService, pythonGeneratorService, workspaceService };
}

function makeDocWithPythonBlock(source: string, editWithAIPrompt: string): { ydoc: Y.Doc; blockId: string } {
  const ydoc = new Y.Doc();
  const blocks = getBlocks(ydoc);
  const block = makePythonBlock('block-1', { source });
  ydoc.transact(() => {
    blocks.set('block-1', block);
  });
  if (editWithAIPrompt) {
    getPythonBlockEditWithAIPrompt(block).insert(0, editWithAIPrompt);
  }
  return { ydoc, blockId: 'block-1' };
}

describe('PythonAiExecutorService', () => {
  describe('editAiPython', () => {
    it('creates a new chat, generates edited code, and applies it as an AI suggestion', async () => {
      const { ydoc, blockId } = makeDocWithPythonBlock('print("old")', 'make it print new');
      const { service, chatService, pythonGeneratorService, eventEmitter } = makeService(ydoc);

      const result = await service.editAiPython('doc-1', 'ws-1', blockId, 'user-1');

      expect(chatService.createChat).toHaveBeenCalledWith('user-1', expect.objectContaining({
        workspaceId: 'ws-1',
        documentId: 'doc-1',
        title: 'Python Edit',
      }));
      expect(pythonGeneratorService.edit).toHaveBeenCalledWith(
        expect.objectContaining({ chat_id: 'chat-new', document_id: 'doc-1' }),
        expect.stringContaining('make it print new'),
      );
      expect(result).toEqual({ result: 'print(1)', chatId: 'chat-new' });

      const block = getBlocks(ydoc).get(blockId) as any;
      expect(getPythonAISuggestions(block)?.toString()).toBe('print(1)');
      expect(eventEmitter.emit).toHaveBeenCalledWith('block.action', expect.objectContaining({ action: 'edited' }));
    });

    it('reuses an existing chat via sendMessage when chatId is provided', async () => {
      const { ydoc, blockId } = makeDocWithPythonBlock('print("old")', 'tweak it');
      const { service, chatService } = makeService(ydoc);

      const result = await service.editAiPython('doc-1', 'ws-1', blockId, 'user-1', 'chat-existing');

      expect(chatService.sendMessage).toHaveBeenCalledWith('user-1', expect.objectContaining({ chatId: 'chat-existing' }));
      expect(chatService.createChat).not.toHaveBeenCalled();
      expect(result.chatId).toBe('chat-existing');
    });

    it('throws when the block does not exist in the document', async () => {
      const ydoc = new Y.Doc();
      const { service } = makeService(ydoc);

      await expect(service.editAiPython('doc-1', 'ws-1', 'missing-block', 'user-1')).rejects.toThrow(
        'Block missing-block not found in document doc-1',
      );
    });

    it('marks the task as an error and returns empty when there is no edit prompt', async () => {
      const { ydoc, blockId } = makeDocWithPythonBlock('print("old")', '');
      const { service, pythonGeneratorService } = makeService(ydoc);

      const result = await service.editAiPython('doc-1', 'ws-1', blockId, 'user-1');

      expect(result.result).toBe('');
      expect(pythonGeneratorService.edit).not.toHaveBeenCalled();
    });

    it('propagates an AI-service error and marks the task failed', async () => {
      const { ydoc, blockId } = makeDocWithPythonBlock('print("old")', 'fix please');
      const { service, pythonGeneratorService } = makeService(ydoc);
      pythonGeneratorService.edit.mockRejectedValue(new Error('upstream down'));

      await expect(service.editAiPython('doc-1', 'ws-1', blockId, 'user-1')).rejects.toThrow('upstream down');

      const tasks = AITasks.fromYjs(ydoc).getBlockTasks(blockId, 'edit-python');
      expect(tasks[0]?.getCompleteStatus()).toBe('error');
    });

    it('does not apply the suggestion when the task is aborted mid-flight', async () => {
      const { ydoc, blockId } = makeDocWithPythonBlock('print("old")', 'change it');
      const { service, pythonGeneratorService, eventEmitter } = makeService(ydoc);

      pythonGeneratorService.edit.mockImplementation(async () => {
        // Simulate a user hitting "stop" while the AI call is in flight —
        // observeStatus should pick this up before the suggestion is applied.
        const task = AITasks.fromYjs(ydoc).getBlockTasks(blockId, 'edit-python')[0];
        task.setAborting();
        return { code: 'should-not-apply' };
      });

      const result = await service.editAiPython('doc-1', 'ws-1', blockId, 'user-1');

      expect(result.result).toBe('should-not-apply');
      const block = getBlocks(ydoc).get(blockId) as any;
      expect(getPythonAISuggestions(block)).toBeNull();
      expect(eventEmitter.emit).not.toHaveBeenCalledWith('block.action', expect.anything());
    });
  });

  describe('fixAiPython', () => {
    it('generates a fix from the block error and applies it as an AI suggestion', async () => {
      const ydoc = new Y.Doc();
      const blocks = getBlocks(ydoc);
      const block = makePythonBlock('block-1', { source: 'print(1/0)' });
      ydoc.transact(() => {
        blocks.set('block-1', block);
        block.setAttribute('result', [
          { type: 'error', ename: 'ZeroDivisionError', evalue: 'division by zero', traceback: ['line1', 'line2'] },
        ] as any);
      });
      const { service, chatService, pythonGeneratorService } = makeService(ydoc);

      const result = await service.fixAiPython('doc-1', 'ws-1', 'block-1', 'user-1');

      expect(chatService.createChat).toHaveBeenCalledWith('user-1', expect.objectContaining({ title: 'Python Fix' }));
      expect(pythonGeneratorService.fix).toHaveBeenCalledWith(
        expect.objectContaining({ document_id: 'doc-1' }),
        expect.stringContaining('ZeroDivisionError'),
      );
      expect(result).toEqual({ result: 'print(2)', chatId: 'chat-new' });
    });

    it('marks the task as an error and returns empty when there is no error output on the block', async () => {
      const ydoc = new Y.Doc();
      const blocks = getBlocks(ydoc);
      const block = makePythonBlock('block-1', { source: 'print(1)' });
      ydoc.transact(() => {
        blocks.set('block-1', block);
      });
      const { service, pythonGeneratorService } = makeService(ydoc);

      const result = await service.fixAiPython('doc-1', 'ws-1', 'block-1', 'user-1');

      expect(result.result).toBe('');
      expect(pythonGeneratorService.fix).not.toHaveBeenCalled();
    });
  });
});
