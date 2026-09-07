// DataFrameService and QueryExecutionService transitively drag in the
// Jupyter/code-execution stack (PythonExecutorService -> @jupyterlab/services,
// an ESM-only SDK) — stub both via an explicit factory so jest never loads
// the real modules.
jest.mock('@/features/code-execution/query-engine/dataframe/dataframe.service', () => ({
  DataFrameService: jest.fn(),
}));
jest.mock('@/features/code-execution/query-engine/query-execution.service', () => ({
  QueryExecutionService: jest.fn(),
}));

import * as Y from 'yjs';
import { DataFrame } from '@sandworm/types';
import {
  createYExecutionQueueItem,
  ExecutionQueueItem,
  makeSQLBlock,
  YBlock,
} from '@sandworm/editor';
import { SqlBlockExecutorService } from '../sql-block-executor.service';
import { DocumentContext } from '../../../interfaces';

function makeService(overrides: Partial<{
  dataFrameService: any;
  queryExecutionService: any;
  blockExecutorDataframeService: any;
  eventEmitter: any;
}> = {}) {
  const dataFrameService = overrides.dataFrameService ?? { list: jest.fn(), rename: jest.fn(), readPage: jest.fn() };
  const queryExecutionService = overrides.queryExecutionService ?? { makeSQLQuery: jest.fn() };
  const blockExecutorDataframeService = overrides.blockExecutorDataframeService ?? { updateDataframesInMap: jest.fn() };
  const eventEmitter = overrides.eventEmitter ?? { emit: jest.fn() };
  const service = new SqlBlockExecutorService(
    dataFrameService,
    queryExecutionService,
    blockExecutorDataframeService,
    eventEmitter,
  );
  return { service, dataFrameService, queryExecutionService, blockExecutorDataframeService, eventEmitter };
}

function makeFixture(opts: { source?: string; dataframeName?: string } = {}) {
  const doc = new Y.Doc();
  const blocks = doc.getMap<YBlock>('blocks');
  const dataframes = doc.getMap<DataFrame>('dataframes');

  const block = makeSQLBlock('block-1', blocks, {
    source: opts.source ?? 'select 1',
    dataframeName: opts.dataframeName ?? 'query_1',
  });
  blocks.set('block-1', block as unknown as YBlock);

  const ctx: DocumentContext = {
    blocks,
    dataframes,
    execution: { workspaceId: 'ws-1', sessionId: 'sess-1', documentId: 'doc-1' },
  };

  const item = createYExecutionQueueItem('block-1', 'user-1', {
    _tag: 'sql',
    isSuggestion: false,
    selectedCode: null,
  });
  // Y.XmlElement attribute writes are buffered until the element is
  // integrated into a Y.Doc — mirror production's queue.push(item) so
  // setCompleted()/getCompleteStatus() actually persist during the test.
  doc.getArray<ExecutionQueueItem>('executionQueue').push([item as any]);
  const executionItem = ExecutionQueueItem.fromYjs(item);

  return { doc, blocks, dataframes, block, ctx, executionItem };
}

describe('SqlBlockExecutorService', () => {
  describe('run', () => {
    it('runs the query, stores the result, and registers the new dataframe on success', async () => {
      const { block, ctx, executionItem } = makeFixture();
      const abort = jest.fn().mockResolvedValue(undefined);
      const successResult = {
        type: 'success' as const,
        version: 3 as const,
        columns: [{ name: 'a', type: 'int64' }],
        rows: [{ a: 1 }],
        count: 1,
        page: 0,
        pageSize: 50,
        pageCount: 1,
        dashboardPage: 0,
        dashboardPageSize: 0,
        dashboardPageCount: 1,
        dashboardRows: [],
      };
      const { service, queryExecutionService } = makeService();
      queryExecutionService.makeSQLQuery.mockResolvedValue([Promise.resolve(successResult), abort]);

      await service.run(executionItem, block, ctx, { _tag: 'sql', isSuggestion: false, selectedCode: null });

      expect(block.getAttribute('result')).toEqual(successResult);
      expect(block.getAttribute('lastQuery')).toBe('select 1');
      expect(ctx.dataframes.get('query_1')).toMatchObject({ name: 'query_1', blockId: 'block-1' });
      expect(executionItem.getCompleteStatus()).toBe('success');
    });

    it('marks the execution as an error and skips dataframe registration on a syntax error', async () => {
      const { block, ctx, executionItem } = makeFixture();
      const abort = jest.fn().mockResolvedValue(undefined);
      const errorResult = { type: 'syntax-error' as const, message: 'bad sql' };
      const { service, queryExecutionService } = makeService();
      queryExecutionService.makeSQLQuery.mockResolvedValue([Promise.resolve(errorResult), abort]);

      await service.run(executionItem, block, ctx, { _tag: 'sql', isSuggestion: false, selectedCode: null });

      expect(block.getAttribute('result')).toEqual(errorResult);
      expect(ctx.dataframes.has('query_1')).toBe(false);
      expect(executionItem.getCompleteStatus()).toBe('error');
    });

    it('completes as error without querying when there is no dataframe name', async () => {
      const { block, ctx, executionItem } = makeFixture();
      block.setAttribute('dataframeName', { value: '', newValue: '' } as any);
      const { service, queryExecutionService } = makeService();

      await service.run(executionItem, block, ctx, { _tag: 'sql', isSuggestion: false, selectedCode: null });

      expect(queryExecutionService.makeSQLQuery).not.toHaveBeenCalled();
      expect(executionItem.getCompleteStatus()).toBe('error');
    });

    it('aborts mid-execution: stops waiting on the query and marks the block as aborted', async () => {
      const { block, ctx, executionItem } = makeFixture();
      let resolveResult!: (value: any) => void;
      const resultPromise = new Promise((resolve) => {
        resolveResult = resolve;
      });
      const abort = jest.fn().mockResolvedValue(undefined);
      const { service, queryExecutionService } = makeService();
      queryExecutionService.makeSQLQuery.mockResolvedValue([resultPromise, abort]);

      const runPromise = service.run(executionItem, block, ctx, {
        _tag: 'sql',
        isSuggestion: false,
        selectedCode: null,
      });

      // Let `run` get past the `await makeSQLQuery(...)` call and register its
      // second abort observer before we flip the item to aborting.
      await Promise.resolve();
      await Promise.resolve();
      executionItem.setAborting();
      resolveResult({ type: 'success', columns: [], rows: [], count: 0 });

      await runPromise;

      expect(abort).toHaveBeenCalledTimes(1);
      expect(block.getAttribute('result')).toEqual({ type: 'abort-error', message: 'Query aborted' });
      expect(executionItem.getCompleteStatus()).toBe('aborted');
      expect(ctx.dataframes.has('query_1')).toBe(false);
    });
  });

  describe('loadPage', () => {
    it('stores the next page and completes as success', async () => {
      const { block, ctx, executionItem } = makeFixture();
      const nextResult = {
        type: 'success' as const,
        version: 2 as const,
        columns: [],
        rows: [],
        count: 0,
        page: 1,
        pageSize: 50,
        pageCount: 1,
      };
      const readPage = jest.fn().mockResolvedValue(nextResult);
      const { service } = makeService({ dataFrameService: { readPage } });

      await service.loadPage({ workspaceId: 'ws-1', sessionId: 'sess-1' }, executionItem, block, ctx);

      expect(block.getAttribute('result')).toMatchObject({ type: 'success', page: 1 });
      expect(executionItem.getCompleteStatus()).toBe('success');
    });

    it('completes as error and logs when reading the page throws', async () => {
      const readPage = jest.fn().mockRejectedValue(new Error('disk error'));
      const { block, ctx, executionItem } = makeFixture();
      const { service } = makeService({ dataFrameService: { readPage } });

      await service.loadPage({ workspaceId: 'ws-1', sessionId: 'sess-1' }, executionItem, block, ctx);

      expect(executionItem.getCompleteStatus()).toBe('error');
    });
  });

  describe('renameDataframe', () => {
    it('rejects an invalid new dataframe name without touching the backend', async () => {
      const { block, ctx, executionItem } = makeFixture();
      block.setAttribute('dataframeName', { value: 'query_1', newValue: '1-bad-name' } as any);
      const rename = jest.fn();
      const { service } = makeService({ dataFrameService: { rename } });

      await service.renameDataframe({ workspaceId: 'ws-1', sessionId: 'sess-1' }, executionItem, block, ctx);

      expect(rename).not.toHaveBeenCalled();
      expect(block.getAttribute('dataframeName')?.error).toBe('invalid-name');
      expect(executionItem.getCompleteStatus()).toBe('error');
    });

    it('renames the dataframe, syncs the map, and completes as success', async () => {
      const { block, ctx, executionItem } = makeFixture();
      block.setAttribute('result', { type: 'success', columns: [], rows: [], count: 0 } as any);
      block.setAttribute('dataframeName', { value: 'query_1', newValue: 'query_renamed' } as any);
      const rename = jest.fn().mockResolvedValue(undefined);
      const list = jest.fn().mockResolvedValue([{ name: 'query_renamed', columns: [], blockId: 'block-1' }]);
      const updateDataframesInMap = jest.fn();
      const { service } = makeService({
        dataFrameService: { rename, list },
        blockExecutorDataframeService: { updateDataframesInMap },
      });

      await service.renameDataframe({ workspaceId: 'ws-1', sessionId: 'sess-1' }, executionItem, block, ctx);

      expect(rename).toHaveBeenCalledWith({ workspaceId: 'ws-1', sessionId: 'sess-1' }, 'query_1', 'query_renamed');
      expect(updateDataframesInMap).toHaveBeenCalled();
      expect(block.getAttribute('dataframeName')).toMatchObject({ value: 'query_renamed', error: undefined });
      expect(executionItem.getCompleteStatus()).toBe('success');
    });

    it('does not rename when there is no successful result to rename from', async () => {
      const { block, ctx, executionItem } = makeFixture();
      block.setAttribute('dataframeName', { value: 'query_1', newValue: 'query_renamed' } as any);
      const rename = jest.fn();
      const { service } = makeService({ dataFrameService: { rename } });

      await service.renameDataframe({ workspaceId: 'ws-1', sessionId: 'sess-1' }, executionItem, block, ctx);

      expect(rename).not.toHaveBeenCalled();
      expect(block.getAttribute('dataframeName')?.value).toBe('query_renamed');
      expect(executionItem.getCompleteStatus()).toBe('error');
    });

    it('completes as error when the rename call throws', async () => {
      const { block, ctx, executionItem } = makeFixture();
      block.setAttribute('result', { type: 'success', columns: [], rows: [], count: 0 } as any);
      block.setAttribute('dataframeName', { value: 'query_1', newValue: 'query_renamed' } as any);
      const rename = jest.fn().mockRejectedValue(new Error('backend unavailable'));
      const { service } = makeService({ dataFrameService: { rename } });

      await service.renameDataframe({ workspaceId: 'ws-1', sessionId: 'sess-1' }, executionItem, block, ctx);

      expect(executionItem.getCompleteStatus()).toBe('error');
    });
  });
});
