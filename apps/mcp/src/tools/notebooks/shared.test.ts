import assert from 'node:assert/strict';
import { test } from 'node:test';
import { z } from 'zod';

import { objectOrJson } from './shared.ts';

const schema = objectOrJson(z.record(z.string(), z.string()));

test('accepts an object', () => {
  assert.deepEqual(schema.parse({ chain: 'ethereum' }), { chain: 'ethereum' });
});

test('accepts the same object as a JSON string', () => {
  assert.deepEqual(schema.parse('{"chain":"ethereum"}'), { chain: 'ethereum' });
});

test('rejects text that is not a JSON object', () => {
  assert.equal(schema.safeParse('not json').success, false);
  assert.equal(schema.safeParse('[1,2]').success, false);
});
