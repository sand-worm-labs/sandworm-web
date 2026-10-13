// Reads a notebook from the Sandworm API the way the view page does: a snapshot of the
// document over plain HTTP, which is decoded into a Yjs doc. Also re-runs the caller's
// own copy of a published notebook, which never changes the saved one.

import { getBlocks, getResultStatus } from '@sandworm/editor';
import * as Y from 'yjs';

import { optional, required } from './config.ts';

export type NotebookRef = { workspaceId: string; notebookId: string };

type ViewReport = { status: 'running' | 'idle'; state: string };

const RERUN_WAIT_SECONDS = 45;
const MAX_POLLS = 12;

// =====================================
// ⬢ Requests
// =====================================
async function call(ref: NotebookRef, path: string, init: RequestInit = {}): Promise<ViewReport> {
  const base = (optional('SANDWORM_API_URL') ?? 'http://localhost:8003/api').replace(/\/$/, '');
  const token = required('SANDWORM_TOKEN');
  const url = `${base}/workspaces/${ref.workspaceId}/documents/${ref.notebookId}/${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Cookie: `access_token=${token}`,
    },
    signal: AbortSignal.timeout((RERUN_WAIT_SECONDS + 15) * 1000),
  });
  if (!res.ok) throw new Error(`Sandworm API ${res.status} for ${path}: ${await res.text()}`);
  return (await res.json()) as ViewReport;
}

const toDoc = (report: ViewReport): Y.Doc => {
  const ydoc = new Y.Doc();
  Y.applyUpdate(ydoc, Buffer.from(report.state, 'base64'));
  return ydoc;
};

// =====================================
// ⬢ Load and re-run
// =====================================
export async function loadNotebook(ref: NotebookRef): Promise<Y.Doc> {
  return toDoc(await call(ref, 'view'));
}

// Runs every cell again and waits for it, following a run that outlasts one request.
export async function rerunNotebook(ref: NotebookRef): Promise<Y.Doc> {
  let report = await call(ref, 'view/run', { method: 'POST', body: JSON.stringify({ waitSeconds: RERUN_WAIT_SECONDS }) });
  for (let poll = 0; report.status === 'running' && poll < MAX_POLLS; poll++) {
    report = await call(ref, `view?waitSeconds=${RERUN_WAIT_SECONDS}`);
  }
  if (report.status === 'running') throw new Error('The notebook is still running after the wait: try again');
  return toDoc(report);
}

// =====================================
// ⬢ What a run left
// =====================================
// How each cell ended. Reported as an observation: the receipt does not hash it.
export function cellStates(ydoc: Y.Doc, cellIds: string[]): Record<string, string> {
  const blocks = getBlocks(ydoc);
  return Object.fromEntries(
    cellIds.map(id => {
      const block = blocks.get(id);
      return [id, block ? String(getResultStatus(block, blocks)) : 'missing'];
    }),
  );
}
