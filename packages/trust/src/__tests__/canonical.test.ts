import assert from 'node:assert/strict';
import { test } from 'node:test';

import { canonicalJson, hashCanonical, normalizeText } from '../canonical.ts';

test('key order does not change the canonical form or the hash', () => {
  const a = { b: 1, a: { d: [1, 2], c: 'x' } };
  const b = { a: { c: 'x', d: [1, 2] }, b: 1 };
  assert.equal(canonicalJson(a), canonicalJson(b));
  assert.equal(hashCanonical(a), hashCanonical(b));
});

test('array order does matter', () => {
  assert.notEqual(hashCanonical({ cells: ['a', 'b'] }), hashCanonical({ cells: ['b', 'a'] }));
});

test('any change to a value changes the hash', () => {
  assert.notEqual(hashCanonical({ q: 'select 1' }), hashCanonical({ q: 'select 2' }));
});

test('line endings and edge whitespace are normalised', () => {
  assert.equal(normalizeText('  select 1\r\nfrom t \r\n'), 'select 1\nfrom t');
});

test('NaN and Infinity are refused', () => {
  assert.throws(() => canonicalJson({ n: Number.NaN }));
  assert.throws(() => canonicalJson({ n: Number.POSITIVE_INFINITY }));
});

test('the run time is part of the input hash, the code hash ignores it', async () => {
  const { hashCode, hashInputs } = await import('../inputs.ts');
  const cells = [{ cellId: 'a', kind: 'sql', source: 'select 1', dataSource: null, dataframe: 'df' }];
  assert.notEqual(hashInputs(cells, '2026-10-13T10:00:00.000Z'), hashInputs(cells, '2026-10-13T11:00:00.000Z'));
  assert.equal(hashCode(cells), hashCode([...cells]));
});
