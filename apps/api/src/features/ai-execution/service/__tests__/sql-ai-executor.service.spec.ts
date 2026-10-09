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
import { AITasks, getBlocks, getSQLAISuggestions, getSQLAttributes, getSQLBlockEditWithAIPrompt, makeSQLBlock } from '@sandworm/editor';
import { writeSource } from './mcp-write';
import { SqlAiExecutorService } from '../sql-ai-executor.service';

function makeService(ydoc: Y.Doc) {
  const yjsDocumentService = {
    getDocId: jest.fn(() => 'doc-1-null'),
    getYDocForUpdateAsync: jest.fn().mockResolvedValue({ ydoc }),
  } as any;
  const persistorFactory = { createDocumentPersistor: jest.fn() } as any;
  const chatService = {
    // Resolves to the given chat, else the document's latest; a chat is never created.
    latestChatId: jest.fn(async (_userId: string, ref: { chatId?: string }) => ref.chatId ?? 'chat-new'),
  } as any;
  // The AI service has the MCP server change the cell, so the fake does the same.
  const changeCell = (text: string) => async (_ctx: unknown, blockId: string) => {
    const blocks = getBlocks(ydoc);
    writeSource(getSQLAttributes(blocks.get(blockId) as any, blocks).source, text);
    return { cell_id: blockId, updated: true };
  };
  const sqlGeneratorService = {
    edit: jest.fn().mockImplementation(changeCell('select 1')),
    fix: jest.fn().mockImplementation(changeCell('select 2')),
  } as any;
  const workspaceService = {
    getWorkspaceById: jest.fn().mockResolvedValue({ id: 'ws-1', assistantModel: 'gpt' }),
  } as any;

  const service = new SqlAiExecutorService(
    yjsDocumentService,
    persistorFactory,
    chatService,
    sqlGeneratorService,
    workspaceService,
  );

  return { service, yjsDocumentService, chatService, sqlGeneratorService, workspaceService };
}

function makeDocWithSQLBlock(source: string, editWithAIPrompt: string): { ydoc: Y.Doc; blockId: string } {
  const ydoc = new Y.Doc();
  const blocks = getBlocks(ydoc);
  const block = makeSQLBlock('block-1', blocks, { source });
  ydoc.transact(() => {
    blocks.set('block-1', block);
  });
  if (editWithAIPrompt) {
    getSQLBlockEditWithAIPrompt(block).insert(0, editWithAIPrompt);
  }
  return { ydoc, blockId: 'block-1' };
}

describe('SqlAiExecutorService', () => {
  describe('editAiSql', () => {
    it('adds to the latest chat and has the AI service change the cell directly', async () => {
      const { ydoc, blockId } = makeDocWithSQLBlock('select old', 'add a filter');
      const { service, chatService, sqlGeneratorService } = makeService(ydoc);

      const result = await service.editAiSql('doc-1', 'ws-1', blockId, 'user-1');

      expect(chatService.latestChatId).toHaveBeenCalledWith('user-1', expect.objectContaining({ documentId: 'doc-1' }));
      expect(sqlGeneratorService.edit).toHaveBeenCalledWith(
        expect.objectContaining({ chat_id: 'chat-new', document_id: 'doc-1' }),
        blockId,
        expect.stringContaining('add a filter'),
        expect.any(AbortSignal),
      );
      expect(result).toEqual({ result: 'select 1', chatId: 'chat-new' });

      const block = getBlocks(ydoc).get(blockId) as any;
      // written by the MCP server, not left as a suggestion to accept
      expect(getSQLAttributes(block, getBlocks(ydoc)).source.toString()).toBe('select 1');
      expect(getSQLAISuggestions(block)).toBeNull();
    });

    it('adds to the given chat when chatId is provided', async () => {
      const { ydoc, blockId } = makeDocWithSQLBlock('select old', 'tweak it');
      const { service, chatService } = makeService(ydoc);

      const result = await service.editAiSql('doc-1', 'ws-1', blockId, 'user-1', 'chat-existing');

      expect(chatService.latestChatId).toHaveBeenCalledWith('user-1', expect.objectContaining({ chatId: 'chat-existing' }));
      expect(result.chatId).toBe('chat-existing');
    });

    it('throws when the block does not exist in the document', async () => {
      const ydoc = new Y.Doc();
      const { service } = makeService(ydoc);

      await expect(service.editAiSql('doc-1', 'ws-1', 'missing-block', 'user-1')).rejects.toThrow(
        'Block missing-block not found in document doc-1',
      );
    });

    it('marks the task as an error and returns empty when there is no edit prompt', async () => {
      const { ydoc, blockId } = makeDocWithSQLBlock('select old', '');
      const { service, sqlGeneratorService } = makeService(ydoc);

      const result = await service.editAiSql('doc-1', 'ws-1', blockId, 'user-1');

      expect(result.result).toBe('');
      expect(sqlGeneratorService.edit).not.toHaveBeenCalled();
    });

    it('propagates an AI-service error and marks the task failed', async () => {
      const { ydoc, blockId } = makeDocWithSQLBlock('select old', 'fix please');
      const { service, sqlGeneratorService } = makeService(ydoc);
      sqlGeneratorService.edit.mockRejectedValue(new Error('upstream down'));

      await expect(service.editAiSql('doc-1', 'ws-1', blockId, 'user-1')).rejects.toThrow('upstream down');

      const tasks = AITasks.fromYjs(ydoc).getBlockTasks(blockId, 'edit-sql');
      expect(tasks[0]?.getCompleteStatus()).toBe('error');
    });

    it('drops the AI call as soon as the user stops the task', async () => {
      const { ydoc, blockId } = makeDocWithSQLBlock('select old', 'change it');
      const { service, sqlGeneratorService } = makeService(ydoc);

      // the AI service never answers: only the stop can end this call
      sqlGeneratorService.edit.mockImplementation(
        (_ctx: unknown, _id: string, _prompt: string, signal: AbortSignal) =>
          new Promise((_resolve, reject) => {
            signal.addEventListener('abort', () => reject(new Error('canceled')));
            AITasks.fromYjs(ydoc).getBlockTasks(blockId, 'edit-sql')[0].setAborting();
          }),
      );

      const result = await service.editAiSql('doc-1', 'ws-1', blockId, 'user-1');

      expect(result.result).toBe('select old');
      const tasks = AITasks.fromYjs(ydoc).getBlockTasks(blockId, 'edit-sql');
      expect(tasks[0]?.getCompleteStatus()).toBe('aborted');
    });

    it('stops reporting success when the task is aborted mid-flight', async () => {
      const { ydoc, blockId } = makeDocWithSQLBlock('select old', 'change it');
      const { service, sqlGeneratorService } = makeService(ydoc);

      sqlGeneratorService.edit.mockImplementation(async () => {
        const task = AITasks.fromYjs(ydoc).getBlockTasks(blockId, 'edit-sql')[0];
        task.setAborting();
        writeSource(getSQLAttributes(getBlocks(ydoc).get(blockId) as any, getBlocks(ydoc)).source, 'applied-already');
        return { cell_id: blockId, updated: true };
      });

      const result = await service.editAiSql('doc-1', 'ws-1', blockId, 'user-1');

      // the edit was already made by the time the stop arrived
      expect(result.result).toBe('applied-already');
      const block = getBlocks(ydoc).get(blockId) as any;
      expect(getSQLAISuggestions(block)).toBeNull();
    });
  });

  describe('fixAiSql', () => {
    it('has the AI service fix the cell from a syntax-error result, emitting created then edited', async () => {
      const ydoc = new Y.Doc();
      const blocks = getBlocks(ydoc);
      const block = makeSQLBlock('block-1', blocks, { source: 'select *' });
      ydoc.transact(() => {
        blocks.set('block-1', block);
        block.setAttribute('result', { type: 'syntax-error', message: 'unexpected token' } as any);
      });
      const { service, chatService, sqlGeneratorService } = makeService(ydoc);

      const result = await service.fixAiSql('doc-1', 'ws-1', 'block-1', 'user-1');

      expect(chatService.latestChatId).toHaveBeenCalledWith('user-1', expect.objectContaining({ documentId: 'doc-1' }));
      expect(sqlGeneratorService.fix).toHaveBeenCalledWith(
        expect.objectContaining({ document_id: 'doc-1' }),
        'block-1',
        expect.stringContaining('unexpected token'),
        expect.any(AbortSignal),
      );
      expect(result).toEqual({ result: 'select 2', chatId: 'chat-new' });

    });

    it('marks the task as an error and returns empty when the block has no syntax-error result', async () => {
      const ydoc = new Y.Doc();
      const blocks = getBlocks(ydoc);
      const block = makeSQLBlock('block-1', blocks, { source: 'select 1' });
      ydoc.transact(() => {
        blocks.set('block-1', block);
        block.setAttribute('result', { type: 'success', count: 1, columns: [] } as any);
      });
      const { service, sqlGeneratorService } = makeService(ydoc);

      const result = await service.fixAiSql('doc-1', 'ws-1', 'block-1', 'user-1');

      expect(result.result).toBe('');
      expect(sqlGeneratorService.fix).not.toHaveBeenCalled();
    });
  });
});
