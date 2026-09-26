import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { runTrinoQuery, TrinoQueryError, type TrinoConfig } from './trino.ts';

const config: TrinoConfig = {
  host: 'trino.test',
  port: 443,
  catalog: 'dune',
  schema: null,
  user: 'reader',
  password: 'secret',
  httpScheme: 'https',
};

type Call = { url: string; method: string; headers: Record<string, string>; body?: string };

// Plays back a scripted sequence of Trino responses and records every request.
function fakeFetch(responses: unknown[], calls: Call[] = []) {
  let index = 0;
  const impl = (async (url: string, init: RequestInit) => {
    calls.push({
      url,
      method: init.method ?? 'GET',
      headers: init.headers as Record<string, string>,
      body: init.body as string | undefined,
    });
    if (init.method === 'DELETE') return new Response(null, { status: 204 });
    const next = responses[index++];
    if (next instanceof Response) return next;
    return new Response(JSON.stringify(next), { status: 200 });
  }) as unknown as typeof fetch;
  return { impl, calls };
}

const options = { maxRows: 100, timeoutMs: 5_000 };

describe('runTrinoQuery', () => {
  it('follows nextUri and collects columns and rows across pages', async () => {
    const { impl, calls } = fakeFetch([
      { nextUri: 'https://trino.test/v1/statement/q1/1' },
      { columns: [{ name: 'n', type: 'integer' }], data: [[1], [2]], nextUri: 'https://trino.test/v1/statement/q1/2' },
      { data: [[3]] },
    ]);

    const result = await runTrinoQuery(config, 'select n from t', { ...options, fetch: impl });

    assert.deepEqual(result, { columns: [{ name: 'n', type: 'integer' }], rows: [[1], [2], [3]], truncated: false });
    assert.equal(calls[0].method, 'POST');
    assert.equal(calls[0].url, 'https://trino.test:443/v1/statement');
    assert.equal(calls[0].body, 'select n from t');
  });

  it('sends the user, catalog and basic auth', async () => {
    const { impl, calls } = fakeFetch([{ columns: [], data: [] }]);

    await runTrinoQuery(config, 'select 1', { ...options, fetch: impl });

    assert.equal(calls[0].headers['X-Trino-User'], 'reader');
    assert.equal(calls[0].headers['X-Trino-Catalog'], 'dune');
    assert.equal(calls[0].headers.Authorization, `Basic ${Buffer.from('reader:secret').toString('base64')}`);
  });

  it('stops at maxRows, flags truncation and cancels the query', async () => {
    const { impl, calls } = fakeFetch([
      { columns: [{ name: 'n', type: 'integer' }], data: [[1], [2], [3]], nextUri: 'https://trino.test/v1/statement/q1/1' },
    ]);

    const result = await runTrinoQuery(config, 'select n from t', { ...options, maxRows: 2, fetch: impl });

    assert.deepEqual(result.rows, [[1], [2]]);
    assert.equal(result.truncated, true);
    assert.equal(calls.at(-1)?.method, 'DELETE');
    assert.equal(calls.at(-1)?.url, 'https://trino.test/v1/statement/q1/1');
  });

  it('does not report truncation when the result is exactly maxRows', async () => {
    const { impl } = fakeFetch([{ columns: [], data: [[1], [2]] }]);

    const result = await runTrinoQuery(config, 'select n from t', { ...options, maxRows: 2, fetch: impl });

    assert.equal(result.truncated, false);
  });

  it('surfaces a Trino query error', async () => {
    const { impl } = fakeFetch([{ error: { message: "line 1:8: Column 'x' cannot be resolved" } }]);

    await assert.rejects(
      runTrinoQuery(config, 'select x', { ...options, fetch: impl }),
      (err: unknown) => err instanceof TrinoQueryError && /cannot be resolved/.test(err.message)
    );
  });

  it('surfaces an HTTP failure', async () => {
    const { impl } = fakeFetch([new Response('nope', { status: 401 })]);

    await assert.rejects(
      runTrinoQuery(config, 'select 1', { ...options, fetch: impl }),
      (err: unknown) => err instanceof TrinoQueryError && /HTTP 401/.test(err.message)
    );
  });

  it('times out a query that never finishes and cancels it', async () => {
    const calls: Call[] = [];
    const impl = (async (url: string, init: RequestInit) => {
      calls.push({ url, method: init.method ?? 'GET', headers: {} });
      if (init.method === 'DELETE') return new Response(null, { status: 204 });
      if (calls.length === 1) {
        return new Response(JSON.stringify({ nextUri: 'https://trino.test/v1/statement/q1/1' }), { status: 200 });
      }
      // Hangs until the abort signal fires, like a stuck query would.
      return new Promise<Response>((_, reject) => {
        init.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
      });
    }) as unknown as typeof fetch;

    await assert.rejects(
      runTrinoQuery(config, 'select 1', { maxRows: 10, timeoutMs: 250, fetch: impl }),
      (err: unknown) => err instanceof TrinoQueryError && /timed out/.test(err.message)
    );
    assert.equal(calls.at(-1)?.method, 'DELETE');
  });
});
