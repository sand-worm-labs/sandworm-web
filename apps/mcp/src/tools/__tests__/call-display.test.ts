import assert from 'node:assert/strict';
import { test } from 'node:test';

import { describeCall, promptOf } from '../call-display.ts';

const json = (value: unknown) => JSON.stringify(value);

test('a plan reads like the AI planning step', () => {
  assert.deepEqual(describeCall('plan_notebook', { goal: 'market mood' }, '{}', false), [
    { kind: 'thinking', text: 'Researching data for: market mood' },
  ]);
  assert.deepEqual(
    describeCall(
      'plan_notebook',
      { goal: 'market mood', blocks: [{ type: 'python', title: 'Fear & Greed' }, { type: 'markdown', title: 'How to read it' }] },
      '{}',
      false,
    ),
    [{ kind: 'thinking', text: 'Planning 2 block(s): python: Fear & Greed, markdown: How to read it' }],
  );
});

test('adding and editing a cell are shown as created and edited blocks', () => {
  const result = json({ cell: { id: 'c1', kind: 'python', title: 'Fear & Greed' } });
  assert.deepEqual(describeCall('add_cell', { type: 'python' }, result, false), [
    { kind: 'block', action: 'created', blockId: 'c1', blockType: 'python', blockTitle: 'Fear & Greed' },
  ]);
  assert.deepEqual(describeCall('update_cell', {}, result, false), [
    { kind: 'block', action: 'edited', blockId: 'c1', blockType: 'python', blockTitle: 'Fear & Greed' },
  ]);
});

test('an untitled markdown cell is named by its first line', () => {
  const result = json({ cell: { id: 'c2', kind: 'markdown', title: '' } });
  const [row] = describeCall('add_cell', { type: 'markdown', content: '\n### What this chart means\n\nText' }, result, false);
  assert.equal(row.kind === 'block' && row.blockTitle, 'What this chart means');
});

test('a run shows the cells that finished, and says which failed', () => {
  const result = json({
    status: 'running',
    cells: [
      { id: 'c1', kind: 'python', title: 'Fear & Greed', state: 'success', executedAt: 't1' },
      { id: 'c2', kind: 'python', title: 'Funding', state: 'error', executedAt: 't2', error: 'Traceback\nKeyError: "coin"' },
      { id: 'c3', kind: 'python', title: 'Trend', state: 'running' },
    ],
  });
  assert.deepEqual(describeCall('run_notebook', {}, result, false), [
    { kind: 'block', action: 'ran', blockId: 'c1', blockType: 'python', blockTitle: 'Fear & Greed', executedAt: 't1' },
    { kind: 'block', action: 'ran', blockId: 'c2', blockType: 'python', blockTitle: 'Funding', executedAt: 't2' },
    { kind: 'thinking', text: 'Funding failed: KeyError: "coin"' },
  ]);
});

test('the saved reply is shown as the message text', () => {
  assert.deepEqual(describeCall('save_reply', { message: 'Built **4 charts**.' }, '{"saved":true}', false), [
    { kind: 'text', text: 'Built **4 charts**.' },
  ]);
});

test('every other call is shown as one step, so nothing is missing from the process', () => {
  assert.deepEqual(describeCall('add_cell', {}, 'Notebook not found', true), [
    { kind: 'thinking', text: '`add_cell` failed: Notebook not found' },
  ]);
  assert.deepEqual(describeCall('list_workspaces', {}, '[]', false), [{ kind: 'thinking', text: 'Listed workspaces' }]);
  assert.deepEqual(describeCall('search_tools', { query: 'funding rates' }, 'not json', false), [
    { kind: 'thinking', text: 'Searched tools for: funding rates' },
  ]);
  assert.deepEqual(describeCall('create_notebook', {}, json({ notebookId: 'n1', title: 'Market Mood' }), false), [
    { kind: 'thinking', text: 'Created notebook: Market Mood' },
  ]);
  assert.deepEqual(describeCall('restart_environment', {}, '{}', false), [
    { kind: 'thinking', text: 'Called restart_environment' },
  ]);
  assert.deepEqual(describeCall('run_notebook', {}, json({ status: 'running', cells: [] }), false), [
    { kind: 'thinking', text: 'Started a run' },
  ]);
});

test('the user\'s request is the prompt; one that comes with the reply is marked as after the work', () => {
  assert.deepEqual(promptOf('plan_notebook', { goal: 'market mood', request: ' make a mood notebook ' }), {
    text: 'make a mood notebook',
    afterWork: false,
  });
  assert.deepEqual(promptOf('save_reply', { message: 'Done.', request: 'make a mood notebook' }), {
    text: 'make a mood notebook',
    afterWork: true,
  });
  assert.equal(promptOf('add_cell', { content: 'select 1' }), undefined);
});
