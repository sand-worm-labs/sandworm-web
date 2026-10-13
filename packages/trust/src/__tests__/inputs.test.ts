import assert from 'node:assert/strict';
import { test } from 'node:test';

import { addBlockGroup, BlockType, getBlocks, getLayout } from '@sandworm/editor';
import * as Y from 'yjs';

import { hashCode, extractInputs, ranAt } from '../inputs.ts';

const CELL_ID = '11111111-1111-4111-8111-111111111111';

// A notebook with one SQL cell, built the way the editor builds one.
function notebook(source: string, lastQueryTime: string | null) {
  const ydoc = new Y.Doc();
  const id = addBlockGroup(getLayout(ydoc), getBlocks(ydoc), { type: BlockType.SQL, title: 'Q', source } as never, 0, false, CELL_ID);
  if (lastQueryTime) getBlocks(ydoc).get(id)!.setAttribute('lastQueryTime' as never, lastQueryTime as never);
  return { ydoc, id };
}

test('a SQL cell is read as its code, data source and dataframe', () => {
  const { ydoc, id } = notebook('  select 1\r\n', null);
  const [input] = extractInputs(ydoc, [id]);
  assert.equal(input?.kind, 'sql');
  assert.equal(input?.source, 'select 1');
});

test('the same code gives the same code hash in two copies of a notebook', () => {
  const a = notebook('select 1', null);
  const b = notebook('select 1', null);
  assert.equal(hashCode(extractInputs(a.ydoc, [a.id])), hashCode(extractInputs(b.ydoc, [b.id])));
});

test('edited code gives a different code hash', () => {
  const a = notebook('select 1', null);
  const b = notebook('select 2', null);
  assert.notEqual(hashCode(extractInputs(a.ydoc, [a.id])), hashCode(extractInputs(b.ydoc, [b.id])));
});

test('the run time is the latest among the cells, and a cell that never ran has none', () => {
  const ran = notebook('select 1', '2026-10-13T10:00:00.000Z');
  assert.equal(ranAt(ran.ydoc, [ran.id]), '2026-10-13T10:00:00.000Z');
  const never = notebook('select 1', null);
  assert.throws(() => ranAt(never.ydoc, [never.id]), /has run yet/);
});

test('a missing cell is an error, not a smaller receipt', () => {
  const { ydoc } = notebook('select 1', null);
  assert.throws(() => extractInputs(ydoc, ['00000000-0000-0000-0000-000000000000']), /No cell/);
});
