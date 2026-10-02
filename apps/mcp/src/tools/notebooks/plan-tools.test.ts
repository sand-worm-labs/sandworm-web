import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { ToolContext } from '../../graphql.ts';
import { research } from './plan-tools.ts';

const tool = (toolId: string) => ({ toolId, name: toolId, description: '', tags: [], g1: null, g2: null, g3: null, g4: null, g5: null, params: [], returns: [] });
const BY_QUERY: Record<string, string[]> = {
  'block activity': ['primitives.block_activity'],
  'nft hold time': ['nft.average_hold_time', 'nft.avg_holder_hold_time'],
};

const searched: string[] = [];
globalThis.fetch = (async (_url: unknown, init: { body: string }) => {
  const { query } = JSON.parse(init.body).variables;
  searched.push(query);
  return new Response(JSON.stringify({ data: { searchTools: (BY_QUERY[query] ?? []).map(tool) } }));
}) as unknown as typeof fetch;

const ctx = { auth: { userId: 'u', token: 't' }, apiUrl: 'http://api', webUrl: '' } as ToolContext;

test('each sub-goal is searched on its own and keeps its own tools', async () => {
  searched.length = 0;
  const groups = await research(ctx, 'Compare chains', [
    { goal: 'block activity', feasible: true },
    { goal: 'nft hold time', feasible: true },
    { goal: 'no data here', feasible: false },
  ]);
  assert.deepEqual(searched.sort(), ['block activity', 'nft hold time']);
  assert.deepEqual(groups.map(g => [g.subGoal, g.tools.map(t => t.toolId)]), [
    ['block activity', ['primitives.block_activity']],
    ['nft hold time', ['nft.average_hold_time', 'nft.avg_holder_hold_time']],
  ]);
});

test('a goal without sub-goals is split on its conjunctions', async () => {
  searched.length = 0;
  await research(ctx, 'block activity and nft hold time', []);
  assert.deepEqual(searched.sort(), ['block activity', 'nft hold time']);
});

test('a single-part goal is searched as a whole', async () => {
  searched.length = 0;
  await research(ctx, 'block activity', []);
  assert.deepEqual(searched, ['block activity']);
});
