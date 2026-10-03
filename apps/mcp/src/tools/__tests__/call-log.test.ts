import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { logToolCalls, redact, type PendingCalls, type ToolCall } from '../call-log.ts';

type Handler = (...params: unknown[]) => Promise<unknown>;
type Saved = { notebookId: string; calls: ToolCall[]; userAgent?: string };

const NOTEBOOK_ID = '4de66e69-90c7-411f-aa7e-d6c50b014160';
const text = (value: string) => ({ content: [{ type: 'text', text: value }] });

// Stands in for McpServer: keeps the handler each tool ends up registered with.
function setup(record?: () => void) {
  const handlers = new Map<string, Handler>();
  const server = {
    registerTool: (name: string, _config: unknown, handler: Handler) => handlers.set(name, handler),
  } as unknown as McpServer;
  const saved: Saved[] = [];
  const pending: PendingCalls = new Map();

  logToolCalls(server, {
    userId: 'user-1',
    userAgent: 'claude-code/2.1',
    pending,
    record: record ?? ((notebookId, calls, userAgent) => saved.push({ notebookId, calls, userAgent })),
  });

  const tool = (name: string, handler: Handler) => {
    server.registerTool(name, { inputSchema: {} }, handler as never);
    return handlers.get(name)!;
  };
  return { tool, saved, pending };
}

test('a call that names a notebook is saved to that notebook', async () => {
  const { tool, saved } = setup();
  const result = text('{"cell":{"id":"c1"}}');
  const addCell = tool('add_cell', async () => result);

  const returned = await addCell({ notebookId: NOTEBOOK_ID, content: 'select 1' }, { requestId: 7 });

  assert.equal(returned, result);
  assert.equal(saved.length, 1);
  assert.equal(saved[0].notebookId, NOTEBOOK_ID);
  assert.equal(saved[0].userAgent, 'claude-code/2.1');
  const [call] = saved[0].calls;
  assert.equal(call.toolName, 'add_cell');
  assert.deepEqual(call.arguments, { notebookId: NOTEBOOK_ID, content: 'select 1' });
  assert.equal(call.result, '{"cell":{"id":"c1"}}');
  assert.equal(call.isError, false);
  assert.equal(call.requestId, '7');
});

test('calls made before a notebook exists are saved with the first one that has it', async () => {
  const { tool, saved, pending } = setup();
  const plan = tool('plan_notebook', async () => text('{"step":"research"}'));
  const create = tool('create_notebook', async () => text(JSON.stringify({ notebookId: NOTEBOOK_ID })));

  await plan({ goal: 'market mood' }, {});
  assert.equal(saved.length, 0);

  await create({ title: 'Crypto Market Mood' }, {});
  assert.equal(saved.length, 1);
  assert.equal(saved[0].notebookId, NOTEBOOK_ID);
  assert.deepEqual(saved[0].calls.map(c => c.toolName), ['plan_notebook', 'create_notebook']);
  assert.equal(pending.size, 0);
});

test('error results and thrown errors are saved as errors', async () => {
  const { tool, saved } = setup();
  const soft = tool('run_notebook', async () => ({ isError: true, ...text('Notebook not found') }));
  const hard = tool('update_cell', async () => {
    throw new Error('boom');
  });

  await soft({ notebookId: NOTEBOOK_ID }, {});
  await assert.rejects(hard({ notebookId: NOTEBOOK_ID }, {}), /boom/);

  assert.deepEqual(saved.map(s => [s.calls[0].toolName, s.calls[0].isError, s.calls[0].result]), [
    ['run_notebook', true, 'Notebook not found'],
    ['update_cell', true, 'boom'],
  ]);
});

test('a failing recorder does not break the tool call', async () => {
  const { tool } = setup(() => {
    throw new Error('api down');
  });
  const run = tool('run_notebook', async () => text('ok'));

  assert.deepEqual(await run({ notebookId: NOTEBOOK_ID }, {}), text('ok'));
});

test('secret values are redacted before they are saved', () => {
  assert.deepEqual(
    redact({
      workspaceId: 'w',
      variables: [{ name: 'ETHERSCAN_API_KEY', value: 'abc123' }],
      nested: { apiKey: 'k', title: 'kept' },
    }),
    {
      workspaceId: 'w',
      variables: [{ name: 'ETHERSCAN_API_KEY', value: '[redacted]' }],
      nested: { apiKey: '[redacted]', title: 'kept' },
    },
  );
});
