import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildProjectTree, type ProjectNode } from '../projects/index.ts';

const doc = (id: string, parentId: string | null, orderIndex: number, deletedAt: string | null = null) => ({
  id,
  title: id,
  parentId,
  orderIndex,
  description: null,
  visibility: 'private',
  publishedAt: null,
  updatedAt: '2026-11-01T00:00:00Z',
  deletedAt,
});

const shape = (nodes: ProjectNode[]): unknown => nodes.map(n => [n.id, shape(n.children)]);

test('nests notebooks under their parents in sidebar order', () => {
  const tree = buildProjectTree([
    doc('b', null, 1),
    doc('a', null, 0),
    doc('a2', 'a', 1),
    doc('a1', 'a', 0),
    doc('a1x', 'a1', 0),
  ]);
  assert.deepEqual(shape(tree), [
    ['a', [['a1', [['a1x', []]]], ['a2', []]]],
    ['b', []],
  ]);
});

test('drops trashed notebooks and lifts orphans to the top level', () => {
  const tree = buildProjectTree([doc('a', null, 0, '2026-11-01T00:00:00Z'), doc('kid', 'gone', 0), doc('b', null, 1)]);
  assert.deepEqual(shape(tree), [['kid', []], ['b', []]]);
});

test('a parent cycle in old data cannot hide or loop forever', () => {
  const tree = buildProjectTree([doc('x', 'y', 0), doc('y', 'x', 1), doc('z', 'x', 0)]);
  assert.deepEqual(shape(tree), [['x', [['z', []]]], ['y', []]]);
});
