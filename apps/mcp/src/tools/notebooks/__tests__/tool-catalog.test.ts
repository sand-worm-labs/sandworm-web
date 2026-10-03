import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { ToolContext } from '../../../graphql.ts';
import { keywordSearch, searchCatalog } from '../tool-catalog.ts';

const tool = (toolId: string, description: string, g1 = 'infra') => ({
  toolId, name: toolId.split('.')[1]!.split('_').map(w => w[0]!.toUpperCase() + w.slice(1)).join(' '),
  description, tags: [], g1, g2: 'gas', g3: null, g4: null, g5: null, params: [], returns: [],
});

const CATALOG = [
  tool('infra.gas_price_percentiles', 'Gas price percentiles per weekday over the last week.'),
  tool('infra.daily_gas_metrics', 'Daily gas used and block activity summary.'),
  tool('primitives.block_activity', 'Blocks and transactions per day.', 'primitives'),
  tool('nft.wallet_pnl', 'Realised profit or loss from NFT trades for a wallet.', 'nft'),
];

let semanticHits: typeof CATALOG | 'down' = [];

globalThis.fetch = (async (_url: unknown, init: { body: string }) => {
  if (init.body.includes('searchTools')) {
    if (semanticHits === 'down') return new Response('{"errors":[{"message":"AI service unavailable"}]}');
    return new Response(JSON.stringify({ data: { searchTools: semanticHits } }));
  }
  return new Response(JSON.stringify({ data: { getTools: CATALOG } }));
}) as unknown as typeof fetch;
const ctx = { auth: { userId: 'u', token: 't' }, apiUrl: 'http://api', webUrl: '' } as ToolContext;

const top = async (query: string) => (await keywordSearch(ctx, query, 3))[0]?.tool.toolId;

test('a short phrase finds the tool named for it', async () => {
  assert.equal(await top('block activity'), 'primitives.block_activity');
});

test('a long goal ignores filler words', async () => {
  assert.equal(await top('Show block activity on Ethereum over the last week'), 'primitives.block_activity');
});

test('plurals match their singular', async () => {
  assert.equal(await top('blocks per day'), 'primitives.block_activity');
});

test('a query with no meaningful words returns nothing', async () => {
  assert.deepEqual(await keywordSearch(ctx, 'show the', 3), []);
});

test('semantic results come back in the order the API ranked them', async () => {
  semanticHits = [CATALOG[3]!, CATALOG[0]!];
  const ids = (await searchCatalog(ctx, 'anything', 3)).map(m => m.tool.toolId);
  assert.deepEqual(ids, ['nft.wallet_pnl', 'infra.gas_price_percentiles']);
});

test('falls back to keywords when the semantic search fails', async () => {
  semanticHits = 'down';
  assert.equal((await searchCatalog(ctx, 'block activity', 3))[0]?.tool.toolId, 'primitives.block_activity');
});

test('falls back to keywords when the semantic search finds nothing', async () => {
  semanticHits = [];
  assert.equal((await searchCatalog(ctx, 'block activity', 3))[0]?.tool.toolId, 'primitives.block_activity');
});
