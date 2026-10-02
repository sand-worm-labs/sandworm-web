import assert from 'node:assert/strict';
import { test } from 'node:test';

import { describeResults, describeRun, type RunReport } from './run.ts';

const cell = (state: string) => ({ id: 'c1', kind: 'python', title: '', state });

test('a finished run reports its cells without a follow-up hint', () => {
  const report: RunReport = { status: 'idle', cellTimeoutSeconds: 300, counts: { success: 1 }, cells: [cell('success')] };

  assert.deepEqual(describeRun(report), {
    status: 'finished',
    cellTimeoutSeconds: 300,
    counts: { success: 1 },
    cells: [cell('success')],
  });
});

test('a run that outlasts the wait points at get_run_results', () => {
  const report: RunReport = {
    status: 'running',
    progress: { completed: 1, total: 3 },
    cellTimeoutSeconds: 300,
    counts: { running: 1 },
    cells: [cell('running')],
  };
  const described = describeRun(report);

  assert.equal(described.status, 'running');
  assert.match(described.message!, /1 of 3 cells done/);
  assert.match(described.message!, /get_run_results/);
});

test('a notebook with nothing to execute says so', () => {
  assert.equal(describeRun({ status: 'idle', counts: {}, cells: [] }).status, 'nothing_to_run');
});

test('results pass the idle state through and flag a run in progress', () => {
  assert.deepEqual(describeResults({ status: 'idle', counts: { not_run: 1 }, cells: [cell('not_run')] }), {
    status: 'idle',
    counts: { not_run: 1 },
    cells: [cell('not_run')],
  });

  const running = describeResults({ status: 'running', progress: { completed: 0, total: 2 }, counts: { queued: 1 }, cells: [cell('queued')] });
  assert.match(running.message!, /0 of 2 cells done/);
});
