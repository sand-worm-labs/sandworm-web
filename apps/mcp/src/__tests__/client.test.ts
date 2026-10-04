import assert from 'node:assert/strict';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { test } from 'node:test';

import { clientOf } from '../client.ts';

const request = (sessionId?: string) => ({ headers: sessionId ? { 'mcp-session-id': sessionId } : {} }) as IncomingMessage;

function response() {
  const headers: Record<string, string> = {};
  const res = { setHeader: (name: string, value: string) => (headers[name] = value) } as unknown as ServerResponse;
  return { res, headers };
}

const initialize = (clientInfo: unknown) => ({ jsonrpc: '2.0', id: 0, method: 'initialize', params: { clientInfo } });

test('the client names itself in initialize, and that name comes back with later requests', () => {
  const { res, headers } = response();
  const client = clientOf(request(), res, initialize({ name: 'claude-code', title: 'Claude Code', version: '2.1.288' }));
  assert.deepEqual(client, { name: 'Claude Code', version: '2.1.288' });

  const later = clientOf(request(headers['Mcp-Session-Id']), response().res, { method: 'tools/call' });
  assert.deepEqual(later, { name: 'Claude Code', version: '2.1.288' });
});

test('a client with no display title is known by its name', () => {
  assert.deepEqual(clientOf(request(), response().res, initialize({ name: 'cursor-vscode', version: '1.0' })), {
    name: 'cursor-vscode',
    version: '1.0',
  });
});

test('a request with no session, or a session id that is not ours, has no client', () => {
  assert.equal(clientOf(request(), response().res, { method: 'tools/call' }), undefined);
  assert.equal(clientOf(request('abc'), response().res, { method: 'tools/call' }), undefined);
  assert.equal(clientOf(request('abc.bm90LWpzb24'), response().res, { method: 'tools/call' }), undefined);

  const { res, headers } = response();
  assert.equal(clientOf(request(), res, initialize({})), undefined);
  assert.deepEqual(headers, {});
});

// The SDK transport runs without sessions here. This checks it neither drops
// the session id we add to the initialize response, nor rejects a later
// request that sends it back.
test('the session id reaches the client and is accepted on later requests', async () => {
  const { createHttpServer } = await import('../server.ts');
  const server = createHttpServer({
    authenticate: async () => ({ userId: 'user-1', token: 't' }),
    publicUrl: 'http://localhost/mcp',
    authServerUrl: 'http://localhost',
    apiUrl: 'http://localhost:1',
    webUrl: 'http://localhost',
  });
  await new Promise<void>(resolve => server.listen(0, resolve));
  const { port } = server.address() as { port: number };
  const post = (body: unknown, sessionId?: string) =>
    fetch(`http://localhost:${port}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
        ...(sessionId ? { 'Mcp-Session-Id': sessionId } : {}),
      },
      body: JSON.stringify(body),
    });

  try {
    const init = await post({
      jsonrpc: '2.0',
      id: 0,
      method: 'initialize',
      params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'claude-code', version: '2.1' } },
    });
    const sessionId = init.headers.get('mcp-session-id');
    assert.equal(init.status, 200);
    assert.ok(sessionId);

    const list = await post({ jsonrpc: '2.0', id: 1, method: 'tools/list' }, sessionId);
    assert.equal(list.status, 200);
    assert.match(await list.text(), /list_workspaces/);
  } finally {
    server.close();
  }
});
