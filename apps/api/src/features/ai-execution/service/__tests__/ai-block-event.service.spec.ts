// WorkspaceService transitively drags in the Jupyter/code-execution stack
// via EnvironmentService, and SqlGeneratorService/PythonGeneratorService
// (real classes, loaded because AiBlockEventService's constructor
// parameter types are kept for Nest's design:paramtypes metadata) import
// WorkspaceService directly. Stub it via an explicit factory so jest never
// loads the real module chain.
jest.mock('@/features/workspace/service/workspace.service', () => ({
  WorkspaceService: jest.fn(),
}));
// YjsDocumentService transitively drags in DocumentExecutorService -> the
// visualization block executor -> an ESM-only dependency; stub it too.
jest.mock('@/features/collaboration/yjs/yjs-document.service', () => ({
  YjsDocumentService: jest.fn(),
}));

import * as Y from 'yjs';
import {
  AITasks,
  BlockType,
  ExecutionQueue,
  getBlocks,
  getLayout,
  makeSQLBlock,
  makePythonBlock,
} from '@sandworm/editor';
import { BlockActionEventNames } from '@/core/events/block-action.events';
import { AiBlockEventService } from '../ai-block-event.service';

function makeService(ydoc: Y.Doc, chat: Record<string, unknown> | null = {
  documentId: 'doc-1',
  workspaceId: 'ws-1',
  userId: 'user-1',
}) {
  const eventEmitter = { on: jest.fn(), emit: jest.fn() } as any;
  const yjsDocumentService = {
    getDocId: jest.fn(() => 'doc-1-null'),
    getYDoc: jest.fn().mockResolvedValue({ ydoc }),
  } as any;
  const persistorFactory = { createDocumentPersistor: jest.fn() } as any;
  const sqlGeneratorService = { fix: jest.fn() } as any;
  const pythonGeneratorService = { fix: jest.fn() } as any;
  const redisService = {
    get: jest.fn().mockResolvedValue(null),
    rpush: jest.fn().mockResolvedValue(undefined),
  } as any;
  const chatRepository = { findOne: jest.fn().mockResolvedValue(chat) } as any;

  const service = new AiBlockEventService(
    eventEmitter,
    yjsDocumentService,
    persistorFactory,
    sqlGeneratorService,
    pythonGeneratorService,
    redisService,
    chatRepository,
  );

  return { service, eventEmitter, yjsDocumentService, persistorFactory, sqlGeneratorService, pythonGeneratorService, redisService, chatRepository };
}

function baseEvent(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    action: 'created',
    chatId: 'chat-1',
    blockType: 'sql',
    blockTitle: 'My Block',
    blockId: undefined,
    content: 'select 1',
    ...overrides,
  } as any;
}

const flush = () => new Promise(resolve => setImmediate(resolve));

describe('AiBlockEventService', () => {
  describe('onModuleInit', () => {
    it('subscribes to BLOCK_ACTION and delegates events to the handler', () => {
      const { service, eventEmitter } = makeService(new Y.Doc());
      const handleSpy = jest.spyOn(service as any, 'handleBlockReady').mockResolvedValue(undefined);

      service.onModuleInit();

      expect(eventEmitter.on).toHaveBeenCalledWith(BlockActionEventNames.BLOCK_ACTION, expect.any(Function));
      const listener = eventEmitter.on.mock.calls[0][1];
      const event = baseEvent();
      listener(event);
      expect(handleSpy).toHaveBeenCalledWith(event);
    });
  });

  describe('handleBlockReady — filtering', () => {
    it('ignores actions other than created/edited/ran', async () => {
      const { service, chatRepository } = makeService(new Y.Doc());
      await (service as any).handleBlockReady(baseEvent({ action: 'generating' }));
      expect(chatRepository.findOne).not.toHaveBeenCalled();
    });

    it('warns and skips on an unknown block type', async () => {
      const { service, chatRepository } = makeService(new Y.Doc());
      await (service as any).handleBlockReady(baseEvent({ blockType: 'some_unknown_type' }));
      expect(chatRepository.findOne).not.toHaveBeenCalled();
    });

    it('skips block types other than pivot_table that carry no content', async () => {
      const { service, chatRepository } = makeService(new Y.Doc());
      await (service as any).handleBlockReady(baseEvent({ content: '' }));
      expect(chatRepository.findOne).not.toHaveBeenCalled();
    });

    it('skips silently when the chat cannot be found', async () => {
      const { service, yjsDocumentService } = makeService(new Y.Doc(), null);
      await (service as any).handleBlockReady(baseEvent());
      expect(yjsDocumentService.getYDoc).not.toHaveBeenCalled();
    });

    it('still processes a content-less pivot_table event (content is not required for it)', async () => {
      const ydoc = new Y.Doc();
      const { service } = makeService(ydoc);
      await (service as any).handleBlockReady(
        baseEvent({ blockType: 'pivot_table', content: '', dataframeName: 'df_1' }),
      );
      const blocks = getBlocks(ydoc);
      expect(Array.from(blocks.values())).toHaveLength(1);
    });

    // Curious asymmetry: VisualizationV2's buildBlockSpec never reads
    // event.content (only dataframeName/title), yet the earlier
    // `blockType !== BlockType.PivotTable && !event.content` guard still
    // requires content to be non-empty for it — an empty-content
    // visualization event is dropped even though nothing would have used
    // the content anyway.
    it('still requires non-empty content for a visualization event even though buildBlockSpec never reads it', async () => {
      const { service, chatRepository } = makeService(new Y.Doc());
      await (service as any).handleBlockReady(
        baseEvent({ blockType: 'visualization', content: '', dataframeName: 'df_1' }),
      );
      expect(chatRepository.findOne).not.toHaveBeenCalled();
    });
  });

  describe('handleBlockReady — dashboard_header', () => {
    it('upserts the document title fragment and returns without inserting a block', async () => {
      const ydoc = new Y.Doc();
      const { service } = makeService(ydoc);

      await (service as any).handleBlockReady(baseEvent({ blockType: 'dashboard_header', content: 'New Title' }));

      const fragment = ydoc.getXmlFragment('title');
      expect(fragment.length).toBe(1);
      expect((fragment.get(0) as Y.XmlElement).toString()).toContain('New Title');
      expect(getBlocks(ydoc).size).toBe(0);
    });
  });

  describe('handleBlockReady — power_toolbox', () => {
    it('parses tool_id/inputs from content and inserts a power_toolbox block', async () => {
      const ydoc = new Y.Doc();
      const { service } = makeService(ydoc);

      await (service as any).handleBlockReady(
        baseEvent({
          blockType: 'power_toolbox',
          content: JSON.stringify({ tool_id: 'holders', inputs: { chain: 'eth' } }),
        }),
      );

      const blocks = getBlocks(ydoc);
      expect(blocks.size).toBe(1);
      const block = Array.from(blocks.values())[0] as any;
      expect(block.getAttribute('type')).toBe(BlockType.PowerToolbox);
      expect(block.getAttribute('toolId')).toBe('holders');
    });

    it('falls back to empty tool_id/inputs and still inserts the block on malformed JSON', async () => {
      const ydoc = new Y.Doc();
      const { service } = makeService(ydoc);
      const warnSpy = jest.spyOn((service as any).logger, 'warn').mockImplementation(() => {});

      await (service as any).handleBlockReady(baseEvent({ blockType: 'power_toolbox', content: 'not json' }));

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('failed to parse power_toolbox content'));
      const blocks = getBlocks(ydoc);
      expect(blocks.size).toBe(1);
      const block = Array.from(blocks.values())[0] as any;
      expect(block.getAttribute('toolId')).toBe('');
    });
  });

  describe('handleBlockReady — pivot_table', () => {
    it('applies the parsed rows/columns/metrics config onto the freshly created block', async () => {
      const ydoc = new Y.Doc();
      const { service } = makeService(ydoc);
      const config = {
        rows: [{ name: 'a', type: 'string' }],
        columns: [{ name: 'b', type: 'string' }],
        metrics: [{ column: { name: 'c', type: 'number' }, aggregateFunction: 'sum' }],
      };

      await (service as any).handleBlockReady(
        baseEvent({ blockType: 'pivot_table', content: JSON.stringify(config), dataframeName: 'df_1' }),
      );

      const block = Array.from(getBlocks(ydoc).values())[0] as any;
      expect(block.getAttribute('rows')).toEqual([{ column: config.rows[0] }]);
      expect(block.getAttribute('metrics')).toEqual(config.metrics);
    });

    it('leaves an unconfigured pivot table when content is malformed JSON', async () => {
      const ydoc = new Y.Doc();
      const { service } = makeService(ydoc);
      const warnSpy = jest.spyOn((service as any).logger, 'warn').mockImplementation(() => {});

      await (service as any).handleBlockReady(
        baseEvent({ blockType: 'pivot_table', content: '{not json', dataframeName: 'df_1' }),
      );

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('failed to parse pivot_table content'));
      const block = Array.from(getBlocks(ydoc).values())[0] as any;
      expect(block.getAttribute('rows')).toEqual([{ column: null }]);
    });
  });

  describe('handleBlockReady — plain content blocks', () => {
    it('inserts a markdown block with the generated content as its source, no execution queue involved', async () => {
      const ydoc = new Y.Doc();
      const { service } = makeService(ydoc);

      await (service as any).handleBlockReady(
        baseEvent({ blockType: 'markdown', content: '# hello', blockId: 'explicit-id' }),
      );

      const block = getBlocks(ydoc).get('explicit-id') as any;
      expect(block).toBeDefined();
      expect(block.getAttribute('type')).toBe(BlockType.Markdown);
      expect(ExecutionQueue.fromYjs(ydoc).getCurrentBatch()).toBeNull();
    });
  });

  describe('handleBlockReady — SQL auto-run', () => {
    it('inserts the block, enqueues it for execution, and publishes a success result once the run completes', async () => {
      const ydoc = new Y.Doc();
      const { service, redisService } = makeService(ydoc);

      await (service as any).handleBlockReady(
        baseEvent({ blockType: 'sql', content: 'select 1', blockId: 'sql-block-1', dataSourceId: 'ds-1' }),
      );

      const blocks = getBlocks(ydoc);
      const block = blocks.get('sql-block-1') as any;
      expect(block).toBeDefined();
      expect(ExecutionQueue.fromYjs(ydoc).getCurrentBatch()).not.toBeNull();

      // Simulate the sidecar's executor finishing the run successfully.
      ydoc.transact(() => {
        block.setAttribute('result', { type: 'success', count: 3, columns: [{ name: 'a', type: 'string' }] });
        block.setAttribute('lastQueryTime', 'T1');
      });
      await flush();

      expect(redisService.rpush).toHaveBeenCalledWith(
        'block:result:sql-block-1',
        expect.stringContaining('"outcome":"success"'),
      );
    });

    it('stops the auto-fix loop immediately when the job is already cancelled', async () => {
      const ydoc = new Y.Doc();
      const { service, redisService, sqlGeneratorService } = makeService(ydoc);
      redisService.get.mockResolvedValue('1');

      await (service as any).handleBlockReady(
        baseEvent({ blockType: 'sql', content: 'select 1', blockId: 'sql-block-1' }),
      );
      await flush();

      expect(redisService.get).toHaveBeenCalledWith('cancel_job:chat-1');
      expect(sqlGeneratorService.fix).not.toHaveBeenCalled();
      expect(redisService.rpush).not.toHaveBeenCalled();
    });

    it('gives up and publishes an error after MAX_SQL_RUN_ATTEMPTS consecutive syntax errors', async () => {
      const ydoc = new Y.Doc();
      const { service, redisService, sqlGeneratorService } = makeService(ydoc);
      sqlGeneratorService.fix.mockResolvedValue({ code: 'select fixed' });

      await (service as any).handleBlockReady(
        baseEvent({ blockType: 'sql', content: 'select 1', blockId: 'sql-block-1', dataSourceId: 'ds-1' }),
      );
      const block = getBlocks(ydoc).get('sql-block-1') as any;

      for (let attempt = 1; attempt <= 3; attempt++) {
        ydoc.transact(() => {
          block.setAttribute('result', { type: 'syntax-error', message: `bad query ${attempt}` });
          block.setAttribute('lastQueryTime', `T${attempt}`);
        });
        await flush();
      }

      expect(sqlGeneratorService.fix).toHaveBeenCalledTimes(2); // attempts 1 and 2 generate a fix; attempt 3 gives up
      expect(redisService.rpush).toHaveBeenCalledWith(
        'block:result:sql-block-1',
        expect.stringContaining('"outcome":"error"'),
      );
      const lastCall = redisService.rpush.mock.calls[redisService.rpush.mock.calls.length - 1];
      expect(lastCall[1]).toContain('bad query 3');
    });

    it('resolves with a null result once waitForSQLResult times out, without publishing anything', async () => {
      jest.useFakeTimers();
      try {
        const ydoc = new Y.Doc();
        const { service, redisService, sqlGeneratorService } = makeService(ydoc);

        await (service as any).handleBlockReady(
          baseEvent({ blockType: 'sql', content: 'select 1', blockId: 'sql-block-1' }),
        );

        jest.advanceTimersByTime(5 * 60 * 1000 + 1);
        // Flush the resolved promise chain under fake timers.
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();

        expect(sqlGeneratorService.fix).not.toHaveBeenCalled();
        expect(redisService.rpush).not.toHaveBeenCalled();
      } finally {
        jest.useRealTimers();
      }
    });
  });

  describe('handleBlockReady — Python auto-run', () => {
    it('inserts the block, enqueues it, and publishes a success summary once the run completes', async () => {
      const ydoc = new Y.Doc();
      const { service, redisService } = makeService(ydoc);

      await (service as any).handleBlockReady(
        baseEvent({ blockType: 'python', content: 'print(1)', blockId: 'py-block-1' }),
      );

      const block = getBlocks(ydoc).get('py-block-1') as any;
      expect(block).toBeDefined();

      ydoc.transact(() => {
        block.setAttribute('result', [{ type: 'stdio', name: 'stdout', text: 'hello world' }]);
        block.setAttribute('lastQueryTime', 'T1');
      });
      await flush();

      expect(redisService.rpush).toHaveBeenCalledWith(
        'block:result:py-block-1',
        expect.stringContaining('"outcome":"success"'),
      );
    });

    it('gives up and publishes an error after MAX_PYTHON_RUN_ATTEMPTS consecutive error results', async () => {
      const ydoc = new Y.Doc();
      const { service, redisService, pythonGeneratorService } = makeService(ydoc);
      pythonGeneratorService.fix.mockResolvedValue({ code: 'print("fixed")' });

      await (service as any).handleBlockReady(
        baseEvent({ blockType: 'python', content: 'print(1)', blockId: 'py-block-1' }),
      );
      const block = getBlocks(ydoc).get('py-block-1') as any;

      for (let attempt = 1; attempt <= 3; attempt++) {
        ydoc.transact(() => {
          block.setAttribute('result', [{ type: 'error', ename: 'ValueError', evalue: `bad ${attempt}`, traceback: [] }]);
          block.setAttribute('lastQueryTime', `T${attempt}`);
        });
        await flush();
      }

      expect(pythonGeneratorService.fix).toHaveBeenCalledTimes(2);
      const lastCall = redisService.rpush.mock.calls[redisService.rpush.mock.calls.length - 1];
      expect(lastCall[1]).toContain('"outcome":"error"');
      expect(lastCall[1]).toContain('bad 3');
    });
  });
});
