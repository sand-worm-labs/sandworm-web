import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { ToolContext } from '../../../graphql.ts';
import { dataModeFromPrompt, resolveDataMode } from '../data-mode.ts';

const ctx = { auth: { userId: 'u', token: 't' }, apiUrl: 'http://api', webUrl: '' } as ToolContext;

// Answers the two API calls the SQL check makes: the default workspace, then the Dune ping.
async function withDune<T>(connStatus: string | Error, run: () => Promise<T>): Promise<T> {
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (url: string) => {
    if (connStatus instanceof Error) throw connStatus;
    const body = String(url).endsWith('/graphql')
      ? { data: { getUserWorkspaceInfo: { id: 'w1' } } }
      : { connStatus };
    return new Response(JSON.stringify(body), { status: 200 });
  }) as typeof fetch;
  try {
    return await run();
  } finally {
    globalThis.fetch = realFetch;
  }
}

test('the prompt says which data to use', () => {
  assert.equal(dataModeFromPrompt('build a stablecoin notebook with open data'), 'open');
  assert.equal(dataModeFromPrompt('use public APIs for this'), 'open');
  assert.equal(dataModeFromPrompt('use our data and tools'), 'sandworm');
  assert.equal(dataModeFromPrompt('query Dune for daily active wallets'), 'sandworm');
  assert.equal(dataModeFromPrompt('use the power tools'), 'sandworm');
});

test('a prompt that names neither, or both, does not decide', () => {
  assert.equal(dataModeFromPrompt('stablecoin supply by chain'), undefined);
  assert.equal(dataModeFromPrompt('compare open data with our data'), undefined);
  assert.equal(dataModeFromPrompt(), undefined);
});

test('the call\'s own choice beats the prompt, and the prompt beats the SQL check', async () => {
  await withDune(new Error('must not be called'), async () => {
    assert.equal(await resolveDataMode(ctx, { data: 'sandworm', request: 'use open data' }), 'sandworm');
    assert.equal(await resolveDataMode(ctx, { request: 'use open data' }), 'open');
  });
});

test('with nothing said, it is open data only when SQL cannot run', async () => {
  assert.equal(await withDune('offline', () => resolveDataMode(ctx, { request: 'stablecoin supply' })), 'open');
  assert.equal(await withDune('online', () => resolveDataMode(ctx, {})), 'sandworm');
  assert.equal(await withDune(new Error('api down'), () => resolveDataMode(ctx, {})), 'sandworm');
});
