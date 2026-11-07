import assert from 'node:assert/strict';
import { test } from 'node:test';

import { assertCanNestUnder, type TreeDoc } from '../tree.ts';

const doc = (id: string, parentId: string | null = null, title = id): TreeDoc => ({ id, title, parentId, orderIndex: 0 });

// folder (top level) holds inside; lone is a top-level notebook with nothing in it.
const folder = doc('folder');
const inside = doc('inside', 'folder');
const lone = doc('lone');
const tree = [folder, inside, lone];

test('a notebook can be created or moved inside a top-level notebook', () => {
  assert.doesNotThrow(() => assertCanNestUnder(tree, 'folder'));
  assert.doesNotThrow(() => assertCanNestUnder(tree, 'folder', lone));
});

test('a missing destination is named, with a way to find the right ID', () => {
  assert.throws(() => assertCanNestUnder(tree, 'nope'), /No notebook nope.*list_projects/);
});

test('a notebook cannot be nested inside itself', () => {
  assert.throws(() => assertCanNestUnder(tree, 'lone', lone), /inside itself/);
});

test('nothing nests inside a notebook that is already inside another', () => {
  assert.throws(() => assertCanNestUnder(tree, 'inside', lone), /one level deep/);
  assert.throws(() => assertCanNestUnder(tree, 'inside'), /one level deep/);
});

test('a notebook that holds others cannot move inside one, so its contents never go two levels deep', () => {
  const holder = doc('holder');
  const held = doc('held', 'holder');
  assert.throws(() => assertCanNestUnder([folder, holder, held], 'folder', holder), /holds 1 notebook of its own/);
});

test('a folder cannot be moved into its own contents', () => {
  assert.throws(() => assertCanNestUnder(tree, 'inside', folder), /one level deep/);
});
