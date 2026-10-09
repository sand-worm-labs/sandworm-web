import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { ToolContext } from '../../../graphql.ts';
import { describeOpenData, matchOpenData, OPEN_DATA_SOURCES } from '../open-data.ts';
import { checkTools, research } from '../plan-tools.ts';

const ids = (query: string) => matchOpenData(query).map(s => s.id);

test('sub-goals are matched to the public APIs that cover them', () => {
  assert.equal(ids('stablecoin supply over time')[0], 'defillama');
  assert.equal(ids('perp funding rates and open interest')[0], 'hyperliquid');
  assert.equal(ids('bitcoin hash rate and miner revenue')[0], 'bitcoin');
  assert.ok(ids('active addresses on arbitrum and base rollups').includes('l2'));
  assert.equal(ids('prediction market odds for the election')[0], 'polymarket');
});

test('Avalanche sub-goals reach the Avalanche sources, and its key is optional', () => {
  assert.equal(ids('avalanche daily active addresses')[0], 'avalanche');
  assert.equal(ids('avalanche subnet validators')[0], 'avalanche');
  assert.ok(ids('snowtrace token transfers of an avalanche wallet').includes('routescan'));
  const avalanche = OPEN_DATA_SOURCES.find(s => s.id === 'avalanche')!;
  assert.deepEqual([avalanche.key?.env, avalanche.key?.required], ['AVACLOUD_API_KEY', false]);
});

test('a sub-goal nothing matches still gets the general market sources', () => {
  assert.deepEqual(ids('zzz qqq'), ['defillama', 'coingecko']);
});

test('every source says whether it needs a key, without leaking its match keywords', () => {
  for (const source of OPEN_DATA_SOURCES) {
    const shown = describeOpenData(source);
    assert.ok(!('keywords' in shown));
    assert.match(shown.key, source.key ? new RegExp(source.key.env) : /none needed/);
    assert.ok(source.endpoints.length > 0, source.id);
  }
});

// Fails the test if anything reaches the network: offline mode must not call the API.
const noNetwork = (() => {
  throw new Error('network call');
}) as unknown as typeof fetch;

const offline = { auth: { userId: 'u', token: 't' }, apiUrl: 'http://api', webUrl: '', openDataOnly: true } as ToolContext;

test('offline, research skips the power tools and returns public APIs for each sub-goal', async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = noNetwork;
  try {
    const groups = await research(offline, 'Stablecoins', [
      { goal: 'stablecoin supply over time', feasible: true },
      { goal: 'bitcoin miner revenue', feasible: true },
    ]);
    assert.deepEqual(groups.map(g => g.tools.length), [0, 0]);
    assert.deepEqual(groups.map(g => g.openData[0]), ['defillama', 'bitcoin']);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test('offline, power tools and sql with nothing to query are rejected; sql over a python block is fine', async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = noNetwork;
  try {
    const block = (type: 'sql' | 'python' | 'power_toolbox', title: string, dependsOn: number[] = []) => ({ type, title, description: 'd', dependsOn });
    const { problems } = await checkTools(offline, [
      block('python', 'Fetch TVL'),
      block('sql', 'Rank chains', [0]),
      block('sql', 'Query Dune'),
      block('power_toolbox', 'Tool'),
    ]);
    assert.equal(problems.length, 2);
    assert.match(problems[0]!, /Block 2 .* sql with nothing to query/);
    assert.match(problems[1]!, /Block 3 .* power_toolbox/);
  } finally {
    globalThis.fetch = realFetch;
  }
});
