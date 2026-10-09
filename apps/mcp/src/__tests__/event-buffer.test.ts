import assert from 'node:assert/strict';
import { test } from 'node:test';

import { EventBuffer } from '../event-buffer.ts';

const options = { maxEventsPerKey: 3, maxKeys: 2, ttlMs: 20 };

test('hands back a key\'s events in arrival order and forgets them', () => {
  const buffer = new EventBuffer<number>(options);
  buffer.push('a', 1);
  buffer.push('b', 9);
  buffer.push('a', 2);
  assert.deepEqual(buffer.take('a'), [1, 2]);
  assert.deepEqual(buffer.take('a'), []);
  assert.equal(buffer.size, 1);
});

test('drops events past the per-key and key limits', () => {
  const buffer = new EventBuffer<number>(options);
  assert.deepEqual([1, 2, 3, 4].map(n => buffer.push('a', n)), [true, true, true, false]);
  assert.equal(buffer.push('b', 1), true);
  assert.equal(buffer.push('c', 1), false);
  assert.deepEqual(buffer.take('a'), [1, 2, 3]);
});

test('expires an idle key and reports what it held', async () => {
  const expired: [string, unknown[]][] = [];
  const buffer = new EventBuffer<number>({ ...options, onExpire: (k, e) => expired.push([k, e]) });
  buffer.push('a', 1);
  await new Promise(r => setTimeout(r, 60));
  assert.deepEqual(expired, [['a', [1]]]);
  assert.equal(buffer.size, 0);
});
