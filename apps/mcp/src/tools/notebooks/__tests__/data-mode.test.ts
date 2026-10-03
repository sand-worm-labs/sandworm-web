import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { ToolContext } from '../../../graphql.ts';
import { dataModeFromPrompt, resolveDataMode } from '../data-mode.ts';

const ctx = { auth: { userId: 'u', token: 't' }, apiUrl: 'http://api', webUrl: '' } as ToolContext;

// Answers the two API calls the SQL check makes: the default workspace, then the chain SQL status.
async function withChainSql<T>(available: boolean | Error, run: () => Promise<T>): Promise<T> {
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (url: string) => {
    if (available instanceof Error) throw available;
    const body = String(url).endsWith('/graphql')
      ? { data: { getUserWorkspaceInfo: { id: 'w1' } } }
      : { available, sources: { dune: available, sandworm_cloud: false } };
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
  await withChainSql(new Error('must not be called'), async () => {
    assert.equal(await resolveDataMode(ctx, { data: 'sandworm', request: 'use open data' }), 'sandworm');
    assert.equal(await resolveDataMode(ctx, { request: 'use open data' }), 'open');
  });
});

test('with nothing said, it is open data only when neither Dune nor Sandworm Cloud can run SQL', async () => {
  assert.equal(await withChainSql(false, () => resolveDataMode(ctx, { request: 'stablecoin supply' })), 'open');
  assert.equal(await withChainSql(true, () => resolveDataMode(ctx, {})), 'sandworm');
  assert.equal(await withChainSql(new Error('api down'), () => resolveDataMode(ctx, {})), 'sandworm');
});
