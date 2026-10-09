import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Y from 'yjs';
import {
  ExecutionQueue,
  getBlocks,
  getLayout,
  getTabsFromBlockGroup,
  isExecutableBlock,
  type ExecutionQueueBatch,
} from '@sandworm/editor';
import type { AllConfigType } from '@/config/config.type';
import type { RunNotebookDto } from './dto/run-notebook.dto';
import type { RunResultsQueryDto } from './dto/run-results-query.dto';
import type { ViewNotebookDto } from './dto/view-notebook.dto';
import { NotebookDocService, type NotebookRef } from './notebook-doc.service';
import { describeCell, liveStates, type CellResult, type CellState, type RunOutcome } from './run/cell-result';

export const DEFAULT_RUN_WAIT_SECONDS = 30;

export type RunReport = {
  // Whether anything in the notebook is executing or queued right now.
  status: 'running' | 'idle';
  progress?: { completed: number; total: number };
  // Runs started here abort any cell that runs longer than this.
  cellTimeoutSeconds?: number;
  counts: Partial<Record<CellState, number>>;
  cells: CellResult[];
};

// What the view page renders: the caller's copy of the published notebook as
// an encoded Yjs state, and whether it is still running.
export type ViewReport = {
  status: 'running' | 'idle';
  progress?: { completed: number; total: number };
  state: string;
};

type Progress = { completed: number; total: number };

function progressOf(batches: ExecutionQueueBatch[]): Progress {
  let total = 0;
  let completed = 0;
  for (const batch of batches) {
    total += batch.length;
    completed += batch.length - batch.remaining;
  }
  return { completed, total };
}

const isRunning = ({ completed, total }: Progress) => completed < total;

// Ids of the cells that execute something, in the order they appear.
function runnableCellIds(ydoc: Y.Doc): string[] {
  const blocks = getBlocks(ydoc);
  return getLayout(ydoc)
    .toArray()
    .flatMap(group => getTabsFromBlockGroup(group, blocks))
    .map(tab => tab.blockId)
    .filter(id => {
      const block = blocks.get(id);
      return block !== undefined && isExecutableBlock(block);
    });
}

@Injectable()
export class NotebookRunService {
  constructor(
    private readonly docs: NotebookDocService,
    private readonly config: ConfigService<AllConfigType>,
  ) {}

  // Queues a run on the notebook's own executor, exactly as pressing Run in the
  // editor does, then waits up to `waitSeconds` for it. The run carries on
  // server side when the wait ends first; `results` picks it up from there.
  async start(ref: NotebookRef, { blockIds, waitSeconds = DEFAULT_RUN_WAIT_SECONDS }: RunNotebookDto): Promise<RunReport> {
    const itemTimeoutMs = this.config.getOrThrow('blockExecutor.maxExecutionTime', { infer: true });

    return this.docs.use(ref, 'editor', async ({ ydoc }) => {
      const queue = ExecutionQueue.fromYjs(ydoc);
      const runnable = runnableCellIds(ydoc);
      const targets = blockIds ? this.select(ydoc, runnable, blockIds) : runnable;
      if (blockIds && targets.length === 0) {
        throw new BadRequestException('None of the given cells can be run: text cells have nothing to execute');
      }

      // One unattended run at a time, so a retrying caller cannot pile them up
      // behind each other. Single cells a user runs by hand still queue as usual.
      const active = queue.toJSON().filter(batch => batch.remaining > 0 && (batch.isRunAll() || batch.getItemTimeoutMs() !== null));
      if (active.length > 0) {
        const { completed, total } = progressOf(active);
        throw new ConflictException(`This notebook is already running (${completed} of ${total} cells done)`);
      }

      const outcomes = new Map<string, RunOutcome>();
      if (targets.length > 0) {
        const batch = blockIds
          ? queue.enqueueBlocks(targets, ref.userId, { itemTimeoutMs })
          : queue.enqueueRunAll(getLayout(ydoc), getBlocks(ydoc), { _tag: 'user', userId: ref.userId }, { itemTimeoutMs });

        // Items are read on every change because the executor drops a batch
        // from the queue, and its statuses with it, as soon as it finishes.
        await this.waitUntil(queue, waitSeconds * 1000, () => {
          for (const item of batch) {
            const outcome = item.getCompleteStatus();
            if (outcome) outcomes.set(item.getBlockId(), outcome);
          }
          return batch.getCurrent() === null;
        });
      }

      return {
        ...this.report(ydoc, queue, new Set(targets), outcomes),
        cellTimeoutSeconds: Math.round(itemTimeoutMs / 1000),
      };
    });
  }

  // The notebook's execution state and each cell's latest result, optionally
  // after waiting for whatever is running to finish.
  async results(ref: NotebookRef, { blockIds, waitSeconds = 0 }: RunResultsQueryDto): Promise<RunReport> {
    return this.docs.use(ref, 'member', async ({ ydoc }) => {
      const queue = ExecutionQueue.fromYjs(ydoc);
      const only = blockIds ? new Set(this.select(ydoc, runnableCellIds(ydoc), blockIds)) : null;

      await this.waitUntil(queue, waitSeconds * 1000, () => !isRunning(progressOf(queue.toJSON())));
      return this.report(ydoc, queue, only, new Map());
    });
  }

  // The caller's copy of the published notebook, optionally after waiting for
  // whatever is running in it to finish.
  async view(ref: NotebookRef, { waitSeconds = 0 }: ViewNotebookDto): Promise<ViewReport> {
    return this.docs.useView(ref, async ({ ydoc }) => {
      const queue = ExecutionQueue.fromYjs(ydoc);
      await this.waitUntil(queue, waitSeconds * 1000, () => !isRunning(progressOf(queue.toJSON())));
      return this.viewReport(ydoc, queue);
    });
  }

  // Runs every cell of the caller's copy again and waits up to `waitSeconds`
  // for it. Joins the run already in progress instead of queueing a second one.
  async rerunView(ref: NotebookRef, { waitSeconds = DEFAULT_RUN_WAIT_SECONDS }: ViewNotebookDto): Promise<ViewReport> {
    const itemTimeoutMs = this.config.getOrThrow('blockExecutor.maxExecutionTime', { infer: true });

    return this.docs.useView(ref, async ({ ydoc }) => {
      const queue = ExecutionQueue.fromYjs(ydoc);
      if (!isRunning(progressOf(queue.toJSON())) && runnableCellIds(ydoc).length > 0) {
        queue.enqueueRunAll(getLayout(ydoc), getBlocks(ydoc), { _tag: 'user', userId: ref.userId }, { itemTimeoutMs });
      }

      await this.waitUntil(queue, waitSeconds * 1000, () => !isRunning(progressOf(queue.toJSON())));
      return this.viewReport(ydoc, queue);
    });
  }

  private viewReport(ydoc: Y.Doc, queue: ExecutionQueue): ViewReport {
    const state = Buffer.from(Y.encodeStateAsUpdate(ydoc)).toString('base64');
    const progress = progressOf(queue.toJSON());
    return isRunning(progress) ? { status: 'running', progress, state } : { status: 'idle', state };
  }

  // The runnable cells among `blockIds`, in notebook order.
  private select(ydoc: Y.Doc, runnable: string[], blockIds: string[]): string[] {
    const blocks = getBlocks(ydoc);
    const unknown = blockIds.filter(id => !blocks.has(id));
    if (unknown.length > 0) {
      throw new BadRequestException(`No cell with id ${unknown.join(', ')} in this notebook`);
    }

    const wanted = new Set(blockIds);
    return runnable.filter(id => wanted.has(id));
  }

  private report(ydoc: Y.Doc, queue: ExecutionQueue, only: Set<string> | null, outcomes: Map<string, RunOutcome>): RunReport {
    const blocks = getBlocks(ydoc);
    const live = liveStates(queue);
    const cells = runnableCellIds(ydoc)
      .filter(id => only === null || only.has(id))
      .map(id => describeCell(blocks.get(id)!, blocks, live.get(id), outcomes.get(id)));

    const counts: RunReport['counts'] = {};
    for (const { state } of cells) counts[state] = (counts[state] ?? 0) + 1;

    const progress = progressOf(queue.toJSON());
    return isRunning(progress) ? { status: 'running', progress, counts, cells } : { status: 'idle', counts, cells };
  }

  // Settles once `done` holds, checked now and on every change to the queue, or
  // after `ms` at the latest. Never rejects: a wait that runs out is not an error.
  private waitUntil(queue: ExecutionQueue, ms: number, done: () => boolean): Promise<void> {
    return new Promise(resolve => {
      if (done() || ms <= 0) return resolve();

      const finish = () => {
        clearTimeout(timer);
        stopObserving();
        resolve();
      };
      const timer = setTimeout(finish, ms);
      const stopObserving = queue.observe(() => {
        if (done()) finish();
      });
    });
  }
}
