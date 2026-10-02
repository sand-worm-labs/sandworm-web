// The executors are only type references here, but importing them for real
// pulls in an ESM-only dependency (aggregate-error) that jest cannot load.
jest.mock('@/features/block-executor/services/executors/visualization-block-executor.service', () => ({
  VisualizationBlockExecutorService: jest.fn(),
}));

import * as Y from 'yjs';
import {
  BlockType,
  ExecutionQueue,
  addBlockGroup,
  getBlocks,
  getDataframes,
  getLayout,
  getPythonBlockResultStatus,
  type ExecutionQueueItem,
} from '@sandworm/editor';
import { DocExecutor } from '../doc-executor';

const USER_ID = '0b0f4c58-6a55-4c3b-9d0a-2f7d7f5d2a11';

function setup(cells: number) {
  const ydoc = new Y.Doc();
  const blocks = getBlocks(ydoc);
  const layout = getLayout(ydoc);
  for (let i = 0; i < cells; i++) {
    addBlockGroup(layout, blocks, { type: BlockType.Python, source: `cell_${i}` }, i);
  }

  // A cell that only ever ends when it is told to stop, like `while True: pass`.
  const python = {
    run: jest.fn(
      (_ctx: unknown, item: ExecutionQueueItem) =>
        new Promise<void>(resolve => {
          item.observeStatus(status => {
            if (status._tag === 'aborting') {
              item.setCompleted('aborted');
              resolve();
            }
          });
        }),
    ),
  };
  const lock = { acquireLock: jest.fn((_name: string, cb: () => Promise<void>) => cb()) };

  const executor = new DocExecutor('doc-null', 'workspace', 'doc', ydoc, blocks, getDataframes(ydoc), { python, lock } as any);
  return { ydoc, executor, python, queue: ExecutionQueue.fromYjs(ydoc) };
}

describe('DocExecutor item time limit', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('aborts an item that outlives the limit of its batch, then carries on with the next', async () => {
    const { ydoc, executor, python, queue } = setup(2);
    const batch = queue.enqueueRunAll(getLayout(ydoc), getBlocks(ydoc), { _tag: 'user', userId: USER_ID }, { itemTimeoutMs: 60_000 });
    const [first, second] = [...batch];

    executor.start();
    await jest.advanceTimersByTimeAsync(59_000);
    expect(first!.getStatus()).toEqual({ _tag: 'running' });

    await jest.advanceTimersByTimeAsync(1_000);
    expect(first!.getStatus()).toEqual({ _tag: 'completed', status: 'error' });

    // The reason outlives the batch: it is stored on the cell as its error.
    const cell = getBlocks(ydoc).get(first!.getBlockId())! as Y.XmlElement<any>;
    expect(cell.getAttribute('result')).toEqual([
      {
        type: 'error',
        ename: 'TimeoutError',
        evalue: 'Stopped after running for 60 seconds, the time limit for a cell in an unattended run',
        traceback: [],
      },
    ]);
    expect(getPythonBlockResultStatus(cell)).toBe('error');

    // The second cell gets a full limit of its own. Its outcome is recorded as
    // it happens, since the finished batch is dropped from the queue right after.
    const outcomes: unknown[] = [];
    second!.observeStatus(status => outcomes.push(status));
    await jest.advanceTimersByTimeAsync(1_000);
    expect(python.run).toHaveBeenCalledTimes(2);
    expect(second!.getStatus()).toEqual({ _tag: 'running' });

    await jest.advanceTimersByTimeAsync(58_000);
    expect(second!.getStatus()).toEqual({ _tag: 'running' });

    await jest.advanceTimersByTimeAsync(5_000);
    expect(outcomes).toContainEqual({ _tag: 'completed', status: 'error' });
    expect(queue.length).toBe(0);
    await executor.stop();
  });

  it('leaves a cell alone when a user stops it before the limit', async () => {
    const { ydoc, executor, queue } = setup(1);
    const batch = queue.enqueueRunAll(getLayout(ydoc), getBlocks(ydoc), { _tag: 'user', userId: USER_ID }, { itemTimeoutMs: 60_000 });
    const [only] = [...batch];
    const outcomes: unknown[] = [];
    only!.observeStatus(status => outcomes.push(status));

    executor.start();
    await jest.advanceTimersByTimeAsync(5_000);
    batch.abort();
    await jest.advanceTimersByTimeAsync(120_000);

    expect(outcomes).toEqual([{ _tag: 'running' }, { _tag: 'aborting' }, { _tag: 'completed', status: 'aborted' }]);
    expect((getBlocks(ydoc).get([...getBlocks(ydoc).keys()][0]!)! as Y.XmlElement<any>).getAttribute('result')).toEqual([]);
    await executor.stop();
  });

  it('never times out a batch without a limit', async () => {
    const { ydoc, executor, queue } = setup(1);
    const batch = queue.enqueueRunAll(getLayout(ydoc), getBlocks(ydoc), { _tag: 'user', userId: USER_ID });
    const [only] = [...batch];

    executor.start();
    await jest.advanceTimersByTimeAsync(24 * 60 * 60 * 1000);

    expect(only!.getStatus()).toEqual({ _tag: 'running' });
    only!.setAborting();
    await jest.advanceTimersByTimeAsync(1_000);
    await executor.stop();
  });
});
