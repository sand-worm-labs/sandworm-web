import assert from 'node:assert/strict';
import { test } from 'node:test';
import { z } from 'zod';

import type { ToolContext } from '../../../graphql.ts';
import { registerCreateNotebookTool } from '../create.ts';
import { registerMoveNotebookTool } from '../move.ts';

type Tool = { config: { inputSchema: Record<string, z.ZodType> }; handler: (args: Record<string, unknown>) => Promise<{ isError?: boolean; content: { text: string }[] }> };

const tools = new Map<string, Tool>();
const server = { registerTool: (name: string, config: Tool['config'], handler: Tool['handler']) => tools.set(name, { config, handler }) };
const ctx = { auth: { userId: 'u', token: 't' }, apiUrl: 'http://api', webUrl: 'http://web' } as ToolContext;
registerMoveNotebookTool(server as never, ctx);
registerCreateNotebookTool(server as never, ctx);

const WORKSPACE = '1f42401c-4934-45a2-9ac7-cf8af9cd6d1f';
const id = (n: number) => `00000000-0000-4000-8000-00000000000${n}`;
const [FOLDER, OTHER, CHILD_A, CHILD_B] = [id(1), id(2), id(3), id(4)];

type Row = { id: string; title: string; parentId: string | null; orderIndex: number; workspaceId: string; deletedAt: string | null };
const row = (docId: string, parentId: string | null, orderIndex: number, title = docId): Row => ({
  id: docId, title, parentId, orderIndex, workspaceId: WORKSPACE, deletedAt: null,
});
// FOLDER holds CHILD_A (0) and CHILD_B (1); OTHER is a top-level notebook with nothing in it.
let workspace: Row[] = [row(FOLDER, null, 0, 'Folder'), row(OTHER, null, 1, 'Other'), row(CHILD_A, FOLDER, 0), row(CHILD_B, FOLDER, 1)];

const requests: { query: string; variables: Record<string, any> }[] = [];
globalThis.fetch = (async (_url: string, init: { body?: string }) => {
  const body = JSON.parse(init.body ?? '{}');
  requests.push({ query: body.query ?? '', variables: body.variables ?? {} });
  const q: string = body.query ?? '';
  if (q.includes('getWorkspaceDocuments')) return Response.json({ data: { getWorkspaceDocuments: workspace } });
  if (q.includes('updateDocument')) {
    const { documentId, input } = body.variables;
    return Response.json({ data: { updateDocument: { ...workspace.find(d => d.id === documentId)!, ...input } } });
  }
  if (q.includes('createDocument')) return Response.json({ data: { createDocument: { id: id(9), title: body.variables.input.title } } });
  return Response.json({ ok: true });
}) as unknown as typeof fetch;

const call = async (name: string, args: Record<string, unknown>) => {
  const { config, handler } = tools.get(name)!;
  requests.length = 0;
  const result = await handler(z.object(config.inputSchema).parse({ workspaceId: WORKSPACE, ...args }));
  // A failure comes back as plain text; a success as JSON.
  const body = result.isError ? undefined : (JSON.parse(result.content[0]!.text) as any);
  return { result, body, mutation: requests.find(r => /mutation/.test(r.query)) };
};

test('move_notebook moves a notebook into a top-level notebook, last by default', async () => {
  const { body, mutation } = await call('move_notebook', { notebookId: OTHER, parentId: FOLDER });
  assert.deepEqual(mutation!.variables.input, { parentId: FOLDER, orderIndex: 2 });
  assert.equal(body.parentId, FOLDER);
  assert.equal(body.parentTitle, 'Folder');
  assert.equal(body.moved, true);
});

test('move_notebook can put it first', async () => {
  const { mutation } = await call('move_notebook', { notebookId: OTHER, parentId: FOLDER, position: 'first' });
  assert.deepEqual(mutation!.variables.input, { parentId: FOLDER, orderIndex: 0 });
});

test('move_notebook sends an explicit null to bring a notebook back to the top level', async () => {
  const { body, mutation } = await call('move_notebook', { notebookId: CHILD_A, parentId: null });
  assert.deepEqual(mutation!.variables.input, { parentId: null, orderIndex: 2 });
  assert.equal(body.parentId, null);
  assert.equal(body.parentTitle, null);
});

test('move_notebook reorders inside the same folder when only a position is given', async () => {
  const { mutation } = await call('move_notebook', { notebookId: CHILD_B, position: 'first' });
  assert.deepEqual(mutation!.variables.input, { parentId: FOLDER, orderIndex: 0 });
});

test('move_notebook does nothing, and says so, when it is already there', async () => {
  const { body, mutation } = await call('move_notebook', { notebookId: CHILD_A, parentId: FOLDER });
  assert.equal(mutation, undefined);
  assert.equal(body.moved, false);
});

test('move_notebook asks where to move when given no destination', async () => {
  const { result, mutation } = await call('move_notebook', { notebookId: OTHER });
  assert.equal(result.isError, true);
  assert.match(result.content[0]!.text, /Say where to move it/);
  assert.equal(mutation, undefined);
});

test('move_notebook refuses a folder that holds notebooks, and writes nothing', async () => {
  const { result, mutation } = await call('move_notebook', { notebookId: FOLDER, parentId: OTHER });
  assert.equal(result.isError, true);
  assert.match(result.content[0]!.text, /holds 2 notebooks/);
  assert.equal(mutation, undefined);
});

test('move_notebook refuses a destination that is itself inside a notebook', async () => {
  const { result, mutation } = await call('move_notebook', { notebookId: OTHER, parentId: CHILD_A });
  assert.equal(result.isError, true);
  assert.match(result.content[0]!.text, /one level deep/);
  assert.equal(mutation, undefined);
});

test('move_notebook ignores a notebook in the trash when counting what a folder holds', async () => {
  workspace = [row(FOLDER, null, 0), row(OTHER, null, 1), { ...row(CHILD_A, FOLDER, 0), deletedAt: '2026-11-01T00:00:00Z' }];
  const { result } = await call('move_notebook', { notebookId: FOLDER, parentId: OTHER });
  assert.notEqual(result.isError, true);
});

test('create_notebook nests the new notebook under a top-level notebook', async () => {
  workspace = [row(FOLDER, null, 0), row(CHILD_A, FOLDER, 0)];
  const { body, mutation } = await call('create_notebook', { title: 'New', parentId: FOLDER });
  assert.equal(mutation!.variables.input.parentId, FOLDER);
  assert.equal(body.parentId, FOLDER);
});

test('create_notebook stays at the top level, as before, without a parentId', async () => {
  const { body, mutation } = await call('create_notebook', { title: 'New' });
  assert.equal('parentId' in mutation!.variables.input, false);
  assert.equal(body.parentId, null);
});

test('create_notebook refuses a parent that is itself nested, and creates nothing', async () => {
  workspace = [row(FOLDER, null, 0), row(CHILD_A, FOLDER, 0)];
  const { result, mutation } = await call('create_notebook', { title: 'New', parentId: CHILD_A });
  assert.equal(result.isError, true);
  assert.equal(mutation, undefined);
});
