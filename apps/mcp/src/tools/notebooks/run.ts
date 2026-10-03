import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { resolveWorkspaceId, type ToolContext } from '../../graphql.ts';
import { rest } from '../../rest.ts';
import { handle, workspaceId } from '../shared.ts';
import { notebookApiPath, notebookId, notebookUrl, objectOrJson } from './shared.ts';

// How long one call waits on a run. Under a minute, because that is where many
// MCP clients give up on a tool call; a longer run is followed with
// get_run_results instead of one call held open.
const WAIT_SECONDS = 45;
// The API answers when the wait ends, so allow that plus slack for the round trip.
const REQUEST_TIMEOUT_MS = (WAIT_SECONDS + 15) * 1000;

type Cell = { id: string; kind: string; title: string; state: string } & Record<string, unknown>;

export type RunReport = {
  status: 'running' | 'idle';
  progress?: { completed: number; total: number };
  cellTimeoutSeconds?: number;
  counts: Record<string, number>;
  cells: Cell[];
};

const cellIds = objectOrJson(z.array(z.uuid()).min(1).max(200)).optional();

const CELL_STATES =
  'Each cell has a state: success, error, aborted (stopped by a user), not_run, or queued / running / stopping while a run is in progress. Python cells carry `outputs` (printed text, rendered tables as text, chart and image summaries), SQL cells carry `result` (row count, columns and the first rows), and failed cells carry `error` with the traceback. Long output is shortened; the notebook keeps all of it.';

export function describeRun(report: RunReport) {
  const { status, progress, cellTimeoutSeconds, counts, cells } = report;
  if (cells.length === 0) {
    return { status: 'nothing_to_run', message: 'This notebook has no cells that execute anything.' };
  }
  if (status === 'running') {
    return {
      status: 'running',
      message: `Still running${progress ? ` (${progress.completed} of ${progress.total} cells done)` : ''}. The run continues on the server: call get_run_results to wait for it and read the rest.`,
      cellTimeoutSeconds,
      counts,
      cells,
    };
  }
  return { status: 'finished', cellTimeoutSeconds, counts, cells };
}

export function describeResults(report: RunReport) {
  const { status, progress, counts, cells } = report;
  if (status === 'running') {
    return {
      status,
      message: `Still running${progress ? ` (${progress.completed} of ${progress.total} cells done)` : ''}. Call get_run_results again to keep waiting.`,
      counts,
      cells,
    };
  }
  return { status, counts, cells };
}

export function registerRunTools(server: McpServer, ctx: ToolContext): void {
  server.registerTool(
    'run_notebook',
    {
      description: [
        `Run a notebook on the workspace's Python environment and return each cell's result. Runs every cell top to bottom, or only \`cellIds\` (ids come from add_cell and get_notebook). A failing cell does not stop the cells after it. Results are saved in the notebook, as if the user had pressed Run.`,
        `Waits up to ${WAIT_SECONDS} seconds. If the run takes longer, status is "running" and it carries on in the background: call get_run_results to follow it. A cell that runs past the time limit (cellTimeoutSeconds) is stopped and fails with a TimeoutError. Fails if this notebook already has a run in progress.`,
        CELL_STATES,
      ].join('\n\n'),
      inputSchema: {
        notebookId,
        workspaceId,
        cellIds: cellIds.describe('Run only these cells, in notebook order. Omit to run the whole notebook'),
      },
    },
    handle(async ({ notebookId, workspaceId, cellIds }) => {
      const ws = await resolveWorkspaceId(ctx, workspaceId);
      const report = await rest<RunReport>(
        ctx,
        'POST',
        `${notebookApiPath(ws, notebookId)}/run`,
        { blockIds: cellIds, waitSeconds: WAIT_SECONDS },
        { timeoutMs: REQUEST_TIMEOUT_MS },
      );
      return { notebookId, url: notebookUrl(ctx, ws, notebookId), ...describeRun(report) };
    }),
  );

  server.registerTool(
    'get_run_results',
    {
      description: [
        `Get the latest result of each runnable cell in a notebook, and whether anything is running. If a run is in progress this waits up to ${WAIT_SECONDS} seconds for it to finish; when status is still "running" afterwards, call it again. Does not run anything: use run_notebook for that.`,
        CELL_STATES,
      ].join('\n\n'),
      inputSchema: {
        notebookId,
        workspaceId,
        cellIds: cellIds.describe('Report only these cells. Omit for every runnable cell'),
        wait: z.boolean().default(true).describe('Set false to get the current state at once instead of waiting for a run in progress'),
      },
    },
    handle(async ({ notebookId, workspaceId, cellIds, wait }) => {
      const ws = await resolveWorkspaceId(ctx, workspaceId);
      const query = new URLSearchParams({ waitSeconds: String(wait ? WAIT_SECONDS : 0) });
      if (cellIds) query.set('blockIds', cellIds.join(','));
      const report = await rest<RunReport>(ctx, 'GET', `${notebookApiPath(ws, notebookId)}/run?${query}`, undefined, {
        timeoutMs: REQUEST_TIMEOUT_MS,
      });
      return { notebookId, url: notebookUrl(ctx, ws, notebookId), ...describeResults(report) };
    }),
  );
}
