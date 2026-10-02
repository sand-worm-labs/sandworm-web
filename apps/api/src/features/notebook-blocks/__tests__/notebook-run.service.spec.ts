// NotebookDocService transitively drags in YjsDocumentService -> the document
// executors -> an ESM-only dependency (aggregate-error); stub it so jest never
// loads that chain. The tests hand the service a fake of it anyway.
jest.mock('../notebook-doc.service', () => ({ NotebookDocService: jest.fn() }));

import * as Y from 'yjs';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { ExecutionQueue, getBlocks } from '@sandworm/editor';
import type { Output } from '@sandworm/types';
import { addBlocks } from '../../collaboration/yjs/shared-doc/ai-blocks';
import type { BlockInput, BlockKind } from '../blocks/block-definition';
import { getDefinition } from '../blocks/registry';
import { NotebookRunService } from '../notebook-run.service';

const USER_ID = '0b0f4c58-6a55-4c3b-9d0a-2f7d7f5d2a11';
const ref = { userId: USER_ID, workspaceId: 'workspace', documentId: 'document' };
const ITEM_TIMEOUT_MS = 300_000;

type Input = BlockInput & { kind: BlockKind };

function setup(inputs: Input[]) {
  const ydoc = new Y.Doc();
  const ids = addBlocks(ydoc, inputs.map(({ kind, ...input }) => getDefinition(kind).toSpec(input)));
  const docs = { use: jest.fn((_ref, _access, work) => Promise.resolve(work({ ydoc }))) };
  const config = { getOrThrow: jest.fn(() => ITEM_TIMEOUT_MS) };
  const service = new NotebookRunService(docs as any, config as any);
  return { ydoc, ids, docs, service, queue: ExecutionQueue.fromYjs(ydoc) };
}

const queued = (queue: ExecutionQueue) => queue.toJSON().map(batch => [...batch].map(item => item.getBlockId()));

// Stands in for the executor: writes each cell's result, completes its queue
// item, then drops the batch the way DocExecutor does.
function execute(ydoc: Y.Doc, results: Record<string, Output[]> = {}) {
  const queue = ExecutionQueue.fromYjs(ydoc);
  const blocks = getBlocks(ydoc);
  for (const item of queue.getCurrentBatch()!) {
    const result = results[item.getBlockId()] ?? [];
    const block = blocks.get(item.getBlockId())! as Y.XmlElement<any>;
    block.setAttribute('result', result);
    block.setAttribute('lastQueryTime', new Date().toISOString());
    item.setCompleted(result.some(output => output.type === 'error') ? 'error' : 'success');
  }
  queue.advance();
}

const flush = () => new Promise(resolve => setImmediate(resolve));

describe('NotebookRunService.start', () => {
  afterEach(() => jest.useRealTimers());

  it('queues every runnable cell in notebook order with the per-cell time limit', async () => {
    const { ids, service, queue, docs } = setup([
      { kind: 'markdown', source: '# Intro' },
      { kind: 'python', source: 'x = 1' },
      { kind: 'python', source: 'print(x)' },
    ]);

    const report = await service.start(ref, { waitSeconds: 0 });

    expect(docs.use).toHaveBeenCalledWith(ref, 'editor', expect.any(Function));
    expect(queued(queue)).toEqual([[ids[1], ids[2]]]);
    const batch = queue.getCurrentBatch()!;
    expect(batch.isRunAll()).toBe(true);
    expect(batch.getItemTimeoutMs()).toBe(ITEM_TIMEOUT_MS);
    expect([...batch].map(item => item.getUserId())).toEqual([USER_ID, USER_ID]);

    expect(report).toMatchObject({
      status: 'running',
      progress: { completed: 0, total: 2 },
      cellTimeoutSeconds: 300,
      counts: { queued: 2 },
    });
    expect(report.cells.map(cell => cell.id)).toEqual([ids[1], ids[2]]);
  });

  it('answers with each cell\'s result once the run finishes', async () => {
    const { ydoc, ids, service } = setup([
      { kind: 'python', title: 'Works', source: 'print("hi")' },
      { kind: 'python', title: 'Breaks', source: '1/0' },
    ]);

    const pending = service.start(ref, { waitSeconds: 30 });
    await flush();
    execute(ydoc, {
      [ids[0]!]: [{ type: 'stdio', name: 'stdout', text: 'hi\n' }],
      [ids[1]!]: [{ type: 'error', ename: 'ZeroDivisionError', evalue: 'division by zero', traceback: ['1/0'] }],
    });
    const report = await pending;

    expect(report.status).toBe('idle');
    expect(report.progress).toBeUndefined();
    expect(report.counts).toEqual({ success: 1, error: 1 });
    expect(report.cells).toEqual([
      expect.objectContaining({ id: ids[0], title: 'Works', state: 'success', outputs: [{ type: 'stdout', text: 'hi\n' }] }),
      expect.objectContaining({
        id: ids[1],
        title: 'Breaks',
        state: 'error',
        error: { name: 'ZeroDivisionError', message: 'division by zero', traceback: '1/0' },
      }),
    ]);
    expect(report.cells[0]!.executedAt).toEqual(expect.any(String));
  });

  it('reports a cell the executor aborted, which its stored result cannot show', async () => {
    const { ydoc, ids, service, queue } = setup([{ kind: 'python', source: 'while True: pass' }]);

    const pending = service.start(ref, { waitSeconds: 30 });
    await flush();
    [...queue.getCurrentBatch()!][0]!.setCompleted('aborted');
    ExecutionQueue.fromYjs(ydoc).advance();

    expect((await pending).cells).toEqual([expect.objectContaining({ id: ids[0], state: 'aborted' })]);
  });

  it('stops waiting after waitSeconds and leaves the run going', async () => {
    jest.useFakeTimers();
    const { service, queue } = setup([{ kind: 'python', source: 'import time; time.sleep(600)' }]);

    const pending = service.start(ref, { waitSeconds: 20 });
    await jest.advanceTimersByTimeAsync(20_000);
    const report = await pending;

    expect(report.status).toBe('running');
    expect(queue.length).toBe(1);
  });

  it('runs only the given cells, in notebook order', async () => {
    const { ids, service, queue } = setup([
      { kind: 'python', source: 'a = 1' },
      { kind: 'python', source: 'b = 2' },
      { kind: 'python', source: 'c = 3' },
    ]);

    const report = await service.start(ref, { blockIds: [ids[2]!, ids[0]!], waitSeconds: 0 });

    expect(queued(queue)).toEqual([[ids[0], ids[2]]]);
    expect(queue.getCurrentBatch()!.isRunAll()).toBe(false);
    expect(queue.getCurrentBatch()!.getItemTimeoutMs()).toBe(ITEM_TIMEOUT_MS);
    expect(report.cells.map(cell => cell.id)).toEqual([ids[0], ids[2]]);
  });

  it('rejects cell ids that are not in the notebook', async () => {
    const { service, queue } = setup([{ kind: 'python', source: 'a = 1' }]);
    const missing = '5f0c6f2e-4a0b-4d0e-9a53-0d6a1f1f7c10';

    await expect(service.start(ref, { blockIds: [missing] })).rejects.toThrow(new BadRequestException(`No cell with id ${missing} in this notebook`));
    expect(queue.length).toBe(0);
  });

  it('rejects a selection with nothing to execute', async () => {
    const { ids, service, queue } = setup([{ kind: 'markdown', source: '# Intro' }, { kind: 'python', source: 'a = 1' }]);

    await expect(service.start(ref, { blockIds: [ids[0]!] })).rejects.toThrow(BadRequestException);
    expect(queue.length).toBe(0);
  });

  it('does nothing for a notebook with no runnable cells', async () => {
    const { service, queue } = setup([{ kind: 'markdown', source: '# Intro' }]);

    const report = await service.start(ref, {});

    expect(report).toMatchObject({ status: 'idle', counts: {}, cells: [] });
    expect(queue.length).toBe(0);
  });

  it('refuses a second run while one is in progress', async () => {
    const { service, queue } = setup([{ kind: 'python', source: 'a = 1' }, { kind: 'python', source: 'b = 2' }]);
    await service.start(ref, { waitSeconds: 0 });
    [...queue.getCurrentBatch()!][0]!.setCompleted('success');

    await expect(service.start(ref, { waitSeconds: 0 })).rejects.toThrow(
      new ConflictException('This notebook is already running (1 of 2 cells done)'),
    );
    expect(queue.length).toBe(1);
  });

  it('queues behind a single cell a user is running by hand', async () => {
    const { ids, service, queue } = setup([{ kind: 'python', source: 'a = 1' }]);
    queue.enqueueBlock(ids[0]!, USER_ID, null, { _tag: 'python', isSuggestion: false });

    await service.start(ref, { waitSeconds: 0 });

    expect(queue.length).toBe(2);
  });
});

describe('NotebookRunService.results', () => {
  afterEach(() => jest.useRealTimers());

  it('reads cell results for any workspace member without queueing anything', async () => {
    const { ydoc, ids, service, queue, docs } = setup([
      { kind: 'markdown', source: '# Intro' },
      { kind: 'python', source: 'print(1)' },
      { kind: 'python', source: 'never run' },
    ]);
    (getBlocks(ydoc).get(ids[1]!) as Y.XmlElement<any>).setAttribute('result', [{ type: 'stdio', name: 'stdout', text: '1\n' }]);
    (getBlocks(ydoc).get(ids[1]!) as Y.XmlElement<any>).setAttribute('lastQueryTime', '2026-10-02T10:00:00.000Z');

    const report = await service.results(ref, {});

    expect(docs.use).toHaveBeenCalledWith(ref, 'member', expect.any(Function));
    expect(queue.length).toBe(0);
    expect(report).toEqual({
      status: 'idle',
      counts: { success: 1, not_run: 1 },
      cells: [
        expect.objectContaining({ id: ids[1], state: 'success', executedAt: '2026-10-02T10:00:00.000Z', outputs: [{ type: 'stdout', text: '1\n' }] }),
        expect.objectContaining({ id: ids[2], state: 'not_run' }),
      ],
    });
  });

  it('shows where a run in progress stands', async () => {
    const { ids, service, queue } = setup([{ kind: 'python', source: 'a = 1' }, { kind: 'python', source: 'b = 2' }, { kind: 'python', source: 'c = 3' }]);
    await service.start(ref, { waitSeconds: 0 });
    const [first, second] = [...queue.getCurrentBatch()!];
    first!.setCompleted('success');
    second!.setRunning();

    const report = await service.results(ref, {});

    expect(report).toMatchObject({ status: 'running', progress: { completed: 1, total: 3 } });
    expect(report.cells.map(cell => [cell.id, cell.state])).toEqual([
      [ids[0], 'not_run'],
      [ids[1], 'running'],
      [ids[2], 'queued'],
    ]);
  });

  it('waits for the notebook to go idle when asked to', async () => {
    const { ydoc, service } = setup([{ kind: 'python', source: 'a = 1' }]);
    await service.start(ref, { waitSeconds: 0 });

    const pending = service.results(ref, { waitSeconds: 30 });
    await flush();
    execute(ydoc);

    expect(await pending).toMatchObject({ status: 'idle', counts: { success: 1 } });
  });

  it('gives up waiting after waitSeconds', async () => {
    jest.useFakeTimers();
    const { service } = setup([{ kind: 'python', source: 'a = 1' }]);
    await service.start(ref, { waitSeconds: 0 });

    const pending = service.results(ref, { waitSeconds: 10 });
    await jest.advanceTimersByTimeAsync(10_000);

    expect((await pending).status).toBe('running');
  });

  it('narrows the report to the given cells', async () => {
    const { ids, service } = setup([{ kind: 'python', source: 'a = 1' }, { kind: 'python', source: 'b = 2' }]);

    const report = await service.results(ref, { blockIds: [ids[1]!] });

    expect(report.cells.map(cell => cell.id)).toEqual([ids[1]]);
  });
});
