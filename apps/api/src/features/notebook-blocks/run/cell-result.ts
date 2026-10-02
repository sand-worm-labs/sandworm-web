import type * as Y from 'yjs';
import {
  getExecutedAt,
  getPivotTableBlockErrorMessage,
  getPowerToolboxAttributes,
  getPowerToolboxBlockIsDirty,
  getPythonAttributes,
  getPythonBlockIsDirty,
  getResultStatus,
  getSQLAttributes,
  getSQLBlockIsDirty,
  getVisualizationV2BlockErrorMessage,
  isPowerToolboxBlock,
  isPythonBlock,
  isSQLBlock,
  switchBlockType,
  type ExecutionQueue,
  type YBlock,
} from '@sandworm/editor';
import type { BlockSummary } from '../blocks/block-definition';
import { summarizeBlock } from '../blocks/registry';
import { describeOutputs, describeQueryResult, type CellError, type CellOutput, type TableResult } from './outputs';

// How a cell's part in a run ended.
export type RunOutcome = 'success' | 'error' | 'aborted';
type LiveState = 'queued' | 'running' | 'stopping';
export type CellState = LiveState | RunOutcome | 'not_run';

export type CellResult = BlockSummary & {
  state: CellState;
  executedAt?: string;
  // The cell was edited after this result was produced: run it again.
  stale?: true;
  error?: CellError;
  outputs?: CellOutput[];
  // Outputs left out of `outputs` because the cell produced too many.
  omittedOutputs?: number;
  result?: TableResult;
};

// Where each cell that is waiting or executing stands, across everything queued.
export function liveStates(queue: ExecutionQueue): Map<string, LiveState> {
  const states = new Map<string, LiveState>();
  for (const batch of queue.toJSON()) {
    for (const item of batch) {
      const blockId = item.getBlockId();
      if (states.has(blockId)) continue;

      const status = item.getStatus()._tag;
      if (status === 'running') states.set(blockId, 'running');
      else if (status === 'aborting') states.set(blockId, 'stopping');
      else if (status === 'enqueued') states.set(blockId, 'queued');
    }
  }
  return states;
}

// With no run to go by, the cell's own stored result says how it last ended.
function storedState(block: YBlock, blocks: Y.Map<YBlock>): CellState {
  if (isSQLBlock(block) && block.getAttribute('result')?.type === 'abort-error') return 'aborted';

  const status = getResultStatus(block, blocks);
  return status === 'idle' ? 'not_run' : status;
}

type Details = Pick<CellResult, 'error' | 'outputs' | 'omittedOutputs' | 'result'>;

function fromOutputs(result: Parameters<typeof describeOutputs>[0]): Details {
  const { error, outputs, omitted } = describeOutputs(result);
  return {
    ...(error ? { error } : {}),
    ...(outputs.length ? { outputs } : {}),
    ...(omitted ? { omittedOutputs: omitted } : {}),
  };
}

const fromMessage = (message: string | null): Details => (message ? { error: { message } } : {});

function details(block: YBlock, blocks: Y.Map<YBlock>): Details {
  return switchBlockType<Details>(block, {
    onPython: b => fromOutputs(getPythonAttributes(b).result ?? []),
    onPowerToolbox: b => fromOutputs(getPowerToolboxAttributes(b).result ?? []),
    onSQL: b => {
      const { error, table } = describeQueryResult(getSQLAttributes(b, blocks).result ?? null);
      return { ...(error ? { error } : {}), ...(table ? { result: table } : {}) };
    },
    onVisualizationV2: b => fromMessage(getVisualizationV2BlockErrorMessage(b)),
    onPivotTable: b => fromMessage(getPivotTableBlockErrorMessage(b)),
    onVisualization: () => ({}),
    onInput: () => ({}),
    onDropdownInput: () => ({}),
    onDateInput: () => ({}),
    onRichText: () => ({}),
    onFileUpload: () => ({}),
    onDashboardHeader: () => ({}),
  });
}

function executedAt(block: YBlock, blocks: Y.Map<YBlock>): string | undefined {
  const date = getExecutedAt(block, blocks);
  return date && !Number.isNaN(date.getTime()) ? date.toISOString() : undefined;
}

function editedSinceRun(block: YBlock, blocks: Y.Map<YBlock>): boolean {
  if (isPythonBlock(block)) return getPythonBlockIsDirty(block);
  if (isSQLBlock(block)) return getSQLBlockIsDirty(block, blocks);
  if (isPowerToolboxBlock(block)) return getPowerToolboxBlockIsDirty(block);
  return false;
}

export function describeCell(
  block: YBlock,
  blocks: Y.Map<YBlock>,
  live: LiveState | undefined,
  outcome: RunOutcome | undefined,
): CellResult {
  const state = live ?? outcome ?? storedState(block, blocks);
  const summary = summarizeBlock(block, blocks);

  // A cell still waiting its turn only has what an earlier run left behind.
  if (state === 'queued') return { ...summary, state };

  // While a cell executes, its outputs so far are live but its run time is
  // still the previous run's.
  const at = live ? undefined : executedAt(block, blocks);
  const stale = (state === 'success' || state === 'error') && editedSinceRun(block, blocks);
  return {
    ...summary,
    state,
    ...(at ? { executedAt: at } : {}),
    ...(stale ? { stale: true as const } : {}),
    ...details(block, blocks),
  };
}
