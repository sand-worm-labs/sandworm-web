import assert from 'node:assert/strict';
import { test } from 'node:test';
import { z } from 'zod';

import type { ToolContext } from '../../../graphql.ts';
import { describeCall } from '../../call-display.ts';
import { registerDashboardTools } from '../dashboard.ts';

type Tool = { description: string; inputSchema: Record<string, z.ZodType> };
type Handler = (args: Record<string, unknown>) => Promise<{ isError?: boolean; content: { text: string }[] }>;

const tools = new Map<string, { config: Tool; handler: Handler }>();
const server = { registerTool: (name: string, config: Tool, handler: Handler) => tools.set(name, { config, handler }) };
const ctx = { auth: { userId: 'u', token: 't' }, apiUrl: 'http://api', webUrl: 'http://web' } as ToolContext;
registerDashboardTools(server as never, ctx);

const NOTEBOOK = '2d3d71d2-c2db-4c60-87b4-d67a537176ba';
const WORKSPACE = '1f42401c-4934-45a2-9ac7-cf8af9cd6d1f';
const CELL = 'fd9d840f-8c25-43eb-9de4-a79951369bf3';

const requests: { method: string; url: string; body: unknown }[] = [];
let reply: { status: number; body: unknown } = { status: 200, body: {} };
globalThis.fetch = (async (url: string, init: { method: string; body?: string }) => {
  requests.push({ method: init.method, url, body: init.body ? JSON.parse(init.body) : undefined });
  return new Response(JSON.stringify(reply.body), { status: reply.status });
}) as unknown as typeof fetch;

const call = async (name: string, args: Record<string, unknown>) => {
  const { config, handler } = tools.get(name)!;
  return handler(z.object(config.inputSchema).parse(args));
};

test('set_dashboard sends the rows to the notebook\'s dashboard and returns the layout with a link', async () => {
  requests.length = 0;
  reply = { status: 200, body: { columns: 24, totalRows: 5, rows: [{ y: 0, height: 5 }], warnings: [] } };
  const rows = [{ tiles: [{ cellId: CELL, width: 24 }], height: 5 }];

  const result = await call('set_dashboard', { notebookId: NOTEBOOK, workspaceId: WORKSPACE, rows });

  assert.deepEqual(requests, [
    { method: 'PUT', url: `http://api/api/workspaces/${WORKSPACE}/documents/${NOTEBOOK}/dashboard`, body: { rows } },
  ]);
  assert.deepEqual(JSON.parse(result.content[0]!.text), {
    notebookId: NOTEBOOK,
    ...reply.body as object,
    url: `http://web/workspace/${WORKSPACE}/documents/${NOTEBOOK}/dashboard`,
  });
});

test('set_dashboard accepts the rows as a JSON string, as some clients send them', async () => {
  requests.length = 0;
  reply = { status: 200, body: { rows: [] } };
  const rows = [{ heading: 'Overview', tiles: [{ cellId: CELL }] }];

  await call('set_dashboard', { notebookId: NOTEBOOK, workspaceId: WORKSPACE, rows: JSON.stringify(rows) });

  assert.deepEqual(requests[0]!.body, { rows });
});

test('set_dashboard clears the dashboard with no rows', async () => {
  requests.length = 0;
  reply = { status: 200, body: { rows: [] } };

  await call('set_dashboard', { notebookId: NOTEBOOK, workspaceId: WORKSPACE, rows: [] });

  assert.deepEqual(requests[0]!.body, { rows: [] });
});

test('set_dashboard turns a refused layout into an error naming what to fix', async () => {
  reply = { status: 400, body: { message: 'The dashboard was not changed. Fix these and call set_dashboard again:\n- Row 1: widths add up to 18' } };

  const result = await call('set_dashboard', { notebookId: NOTEBOOK, workspaceId: WORKSPACE, rows: [{ tiles: [{ cellId: CELL, width: 18 }] }] });

  assert.equal(result.isError, true);
  assert.match(result.content[0]!.text, /Row 1: widths add up to 18/);
});

test('set_dashboard rejects tile widths outside the 24-column grid before calling the API', () => {
  const { config } = tools.get('set_dashboard')!;
  const schema = z.object(config.inputSchema);
  const parse = (width: number) => schema.safeParse({ notebookId: NOTEBOOK, rows: [{ tiles: [{ cellId: CELL, width }] }] }).success;

  assert.equal(parse(24), true);
  assert.equal(parse(25), false);
  assert.equal(parse(0), false);
  assert.equal(parse(8.5), false);
});

test('get_dashboard reads the layout', async () => {
  requests.length = 0;
  reply = { status: 200, body: { rows: [], warnings: [] } };

  await call('get_dashboard', { notebookId: NOTEBOOK, workspaceId: WORKSPACE });

  assert.deepEqual(requests.map(r => [r.method, r.url]), [['GET', `http://api/api/workspaces/${WORKSPACE}/documents/${NOTEBOOK}/dashboard`]]);
});

test('the description tells the agent how big to make things on a 1300px screen', () => {
  const { description } = tools.get('set_dashboard')!.config;

  assert.match(description, /1300px/);
  assert.match(description, /add up to 24/);
  assert.match(description, /stat_card/);
  assert.match(description, /at least 12 columns and 8 rows/);
  assert.match(description, /`visualization` cells render blank/);
});

test('the chat shows a dashboard layout as one line', () => {
  const result = JSON.stringify({ rows: [{ tiles: [{}, {}, {}] }, { heading: 'Trends' }, { tiles: [{}] }] });

  assert.deepEqual(describeCall('set_dashboard', {}, result, false), [
    { kind: 'thinking', text: 'Laid out the dashboard: 4 tile(s) in 3 row(s)' },
  ]);
});

const HEADING = '0b9d6f3c-8d55-4f0e-9c2e-3a7f4c2d1e10';

test('edit_header patches one heading and returns the layout with a link', async () => {
  requests.length = 0;
  reply = { status: 200, body: { columns: 24, totalRows: 5, rows: [{ y: 0, height: 1, heading: 'New title', headingId: HEADING }], warnings: [] } };

  const result = await call('edit_header', { notebookId: NOTEBOOK, workspaceId: WORKSPACE, headingId: HEADING, content: 'New title' });

  assert.deepEqual(requests, [
    {
      method: 'PATCH',
      url: `http://api/api/workspaces/${WORKSPACE}/documents/${NOTEBOOK}/dashboard/headings/${HEADING}`,
      body: { content: 'New title' },
    },
  ]);
  assert.match(result.content[0]!.text, /New title/);
  assert.match(result.content[0]!.text, new RegExp(`/documents/${NOTEBOOK}/dashboard`));
});

test('edit_header rejects an empty or over-long heading before calling the API', () => {
  const schema = z.object(tools.get('edit_header')!.config.inputSchema);
  const base = { notebookId: NOTEBOOK, workspaceId: WORKSPACE, headingId: HEADING };

  assert.equal(schema.safeParse({ ...base, content: '' }).success, false);
  assert.equal(schema.safeParse({ ...base, content: 'x'.repeat(121) }).success, false);
  assert.equal(schema.safeParse({ ...base, headingId: 'not-a-uuid', content: 'ok' }).success, false);
});

test('edit_header is described in the call log by its new text', () => {
  assert.match(JSON.stringify(describeCall('edit_header', { content: 'New title' }, '{}', false)), /New title/);
});
