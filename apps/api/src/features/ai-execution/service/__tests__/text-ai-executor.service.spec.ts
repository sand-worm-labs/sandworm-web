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
import { AITasks, getBlocks, getMarkdownAISuggestions, getMarkdownAttributes, getMarkdownBlockEditWithAIPrompt, makeMarkdownBlock } from '@sandworm/editor';
import { writeSource } from './mcp-write';
import { TextAiExecutorService } from '../text-ai-executor.service';

function makeService(ydoc: Y.Doc) {
  const yjsDocumentService = {
    getDocId: jest.fn(() => 'doc-1-null'),
    getYDocForUpdateAsync: jest.fn().mockResolvedValue({ ydoc }),
  } as any;
  const persistorFactory = { createDocumentPersistor: jest.fn() } as any;
  const eventEmitter = { emit: jest.fn() } as any;
  // The AI service has the MCP server change the cell, so the fake does the same.
  const markdownGeneratorService = {
    edit: jest.fn().mockImplementation(async (_ctx: unknown, blockId: string) => {
      writeSource(getMarkdownAttributes(getBlocks(ydoc).get(blockId) as any).source, 'new markdown');
      return { cell_id: blockId, updated: true };
    }),
  } as any;
  const workspaceService = {
    getWorkspaceById: jest.fn().mockResolvedValue({ id: 'ws-1', assistantModel: 'gpt' }),
  } as any;
  const chatService = {
    sendMessage: jest.fn().mockResolvedValue(undefined),
    createChat: jest.fn().mockResolvedValue({ id: 'chat-new' }),
  } as any;

  const service = new TextAiExecutorService(
    yjsDocumentService,
    persistorFactory,
    eventEmitter,
    markdownGeneratorService,
    workspaceService,
    chatService,
  );

  return { service, yjsDocumentService, eventEmitter, chatService, markdownGeneratorService, workspaceService };
}

function makeDocWithMarkdownBlock(source: string, editWithAIPrompt: string): { ydoc: Y.Doc; blockId: string } {
  const ydoc = new Y.Doc();
  const blocks = getBlocks(ydoc);
  const block = makeMarkdownBlock('block-1');
  ydoc.transact(() => {
    blocks.set('block-1', block);
  });
  if (source) {
    (block.getAttribute('source') as Y.Text).insert(0, source);
  }
  if (editWithAIPrompt) {
    getMarkdownBlockEditWithAIPrompt(block).insert(0, editWithAIPrompt);
  }
  return { ydoc, blockId: 'block-1' };
}

describe('TextAiExecutorService', () => {
  describe('editAiText', () => {
    it('creates a new chat and has the AI service change the cell directly', async () => {
      const { ydoc, blockId } = makeDocWithMarkdownBlock('# old', 'make it a list');
      const { service, chatService, markdownGeneratorService, eventEmitter } = makeService(ydoc);

      const result = await service.editAiText('doc-1', 'ws-1', blockId, 'user-1');

      expect(chatService.createChat).toHaveBeenCalledWith('user-1', expect.objectContaining({ title: 'Markdown Edit' }));
      expect(markdownGeneratorService.edit).toHaveBeenCalledWith(
        expect.objectContaining({ chat_id: 'chat-new', document_id: 'doc-1' }),
        blockId,
        expect.stringContaining('make it a list'),
      );
      expect(result).toEqual({ result: 'new markdown', chatId: 'chat-new' });

      const block = getBlocks(ydoc).get(blockId) as any;
      // written by the MCP server, not left as a suggestion to accept
      expect(getMarkdownAttributes(block).source.toString()).toBe('new markdown');
      expect(getMarkdownAISuggestions(block)).toBeNull();
      expect(eventEmitter.emit).toHaveBeenCalledWith('block.action', expect.objectContaining({ action: 'edited' }));
    });

    it('reuses an existing chat via sendMessage when chatId is provided', async () => {
      const { ydoc, blockId } = makeDocWithMarkdownBlock('# old', 'tweak it');
      const { service, chatService } = makeService(ydoc);

      const result = await service.editAiText('doc-1', 'ws-1', blockId, 'user-1', 'chat-existing');

      expect(chatService.sendMessage).toHaveBeenCalledWith('user-1', expect.objectContaining({ chatId: 'chat-existing' }));
      expect(chatService.createChat).not.toHaveBeenCalled();
      expect(result.chatId).toBe('chat-existing');
    });

    it('throws when the block does not exist in the document', async () => {
      const ydoc = new Y.Doc();
      const { service } = makeService(ydoc);

      await expect(service.editAiText('doc-1', 'ws-1', 'missing-block', 'user-1')).rejects.toThrow(
        'Block missing-block not found in document doc-1',
      );
    });

    it('marks the task as an error and returns empty when there is no edit prompt', async () => {
      const { ydoc, blockId } = makeDocWithMarkdownBlock('# old', '');
      const { service, markdownGeneratorService } = makeService(ydoc);

      const result = await service.editAiText('doc-1', 'ws-1', blockId, 'user-1');

      expect(result.result).toBe('');
      expect(markdownGeneratorService.edit).not.toHaveBeenCalled();
    });

    it('propagates an AI-service error and marks the task failed', async () => {
      const { ydoc, blockId } = makeDocWithMarkdownBlock('# old', 'fix please');
      const { service, markdownGeneratorService } = makeService(ydoc);
      markdownGeneratorService.edit.mockRejectedValue(new Error('upstream down'));

      await expect(service.editAiText('doc-1', 'ws-1', blockId, 'user-1')).rejects.toThrow('upstream down');

      const tasks = AITasks.fromYjs(ydoc).getBlockTasks(blockId, 'edit-text');
      expect(tasks[0]?.getCompleteStatus()).toBe('error');
    });

    it('stops reporting success when the task is aborted mid-flight', async () => {
      const { ydoc, blockId } = makeDocWithMarkdownBlock('# old', 'change it');
      const { service, markdownGeneratorService, eventEmitter } = makeService(ydoc);

      markdownGeneratorService.edit.mockImplementation(async () => {
        const task = AITasks.fromYjs(ydoc).getBlockTasks(blockId, 'edit-text')[0];
        task.setAborting();
        writeSource(getMarkdownAttributes(getBlocks(ydoc).get(blockId) as any).source, 'applied-already');
        return { cell_id: blockId, updated: true };
      });

      const result = await service.editAiText('doc-1', 'ws-1', blockId, 'user-1');

      // the edit was already made by the time the stop arrived
      expect(result.result).toBe('applied-already');
      const block = getBlocks(ydoc).get(blockId) as any;
      expect(getMarkdownAISuggestions(block)).toBeNull();
      expect(eventEmitter.emit).not.toHaveBeenCalledWith('block.action', expect.anything());
    });
  });
});
