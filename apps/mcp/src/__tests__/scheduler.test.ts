import assert from 'node:assert/strict';
import { test } from 'node:test';

import { QueueFullError, Scheduler } from '../scheduler.ts';

function gate() {
  let open!: () => void;
  const promise = new Promise<void>(resolve => (open = resolve));
  return { promise, open };
}

test('never runs more than the concurrency limit, and finishes everything queued', async () => {
  const s = new Scheduler({ concurrency: 2, perUser: 2, maxQueued: 100 });
  let active = 0;
  let peak = 0;
  const jobs = Array.from({ length: 10 }, (_, i) =>
    s.run(`u${i}`, async () => {
      peak = Math.max(peak, ++active);
      await new Promise(r => setTimeout(r, 5));
      active--;
      return i;
    }),
  );
  assert.deepEqual(await Promise.all(jobs), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  assert.equal(peak, 2);
});

test('a user with a long backlog does not make another user wait for it', async () => {
  const s = new Scheduler({ concurrency: 1, perUser: 1, maxQueued: 100 });
  const order: string[] = [];
  const hold = gate();
  const first = s.run('b', async () => (order.push('b0'), hold.promise));
  const rest = [1, 2, 3].map(i => s.run('b', async () => void order.push(`b${i}`)));
  const a = s.run('a', async () => void order.push('a'));

  hold.open();
  await Promise.all([first, ...rest, a]);
  assert.deepEqual(order, ['b0', 'a', 'b1', 'b2', 'b3']);
});

test('one user stays within their own limit', async () => {
  const s = new Scheduler({ concurrency: 10, perUser: 2, maxQueued: 100 });
  let active = 0;
  let peak = 0;
  await Promise.all(
    Array.from({ length: 6 }, () =>
      s.run('u', async () => {
        peak = Math.max(peak, ++active);
        await new Promise(r => setTimeout(r, 5));
        active--;
      }),
    ),
  );
  assert.equal(peak, 2);
});

test('rejects when the queue is full, and a failing call frees its slot', async () => {
  const s = new Scheduler({ concurrency: 1, perUser: 1, maxQueued: 1 });
  const hold = gate();
  const running = s.run('u', () => hold.promise);
  const queued = s.run('u', async () => 'ok');
  await assert.rejects(s.run('u', async () => 'no'), QueueFullError);

  hold.open();
  await running;
  assert.equal(await queued, 'ok');
  await assert.rejects(s.run('u', () => Promise.reject(new Error('boom'))), /boom/);
  assert.deepEqual(s.stats(), { running: 0, queued: 0 });
});
