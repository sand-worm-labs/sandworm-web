// PQueue is real ESM and schedules work over real microtasks/timers, which
// makes the acquire/retry paths hard to drive deterministically in tests.
// Replace it with a minimal fake that preserves concurrency-1 ordering
// (each added task runs after the previous one settles) without any of the
// internal scheduling machinery.
jest.mock('p-queue', () => {
  class FakePQueue {
    size = 0;
    pending = 0;
    private tail: Promise<any> = Promise.resolve();
    clear = jest.fn();
    add(fn: () => any) {
      const run = this.tail.then(() => fn());
      this.tail = run.catch(() => undefined);
      return run;
    }
  }
  return { __esModule: true, default: FakePQueue };
});

import { LockService } from '../lock.services';
import { AlreadyAcquiredError } from '../lock.errors';
import { getChannel } from '../lock.utils';
import { LOCK_CONFIG } from '../lock.constants';

function makeService() {
  const pubsub = {
    subscribe: jest.fn().mockResolvedValue(jest.fn().mockResolvedValue(undefined)),
    publish: jest.fn().mockResolvedValue(undefined),
  } as any;

  const lockRepository = {
    findOne: jest.fn(),
    insert: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
  } as any;

  const service = new LockService(pubsub, lockRepository);
  return { service, pubsub, lockRepository };
}

describe('LockService', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  describe('acquireLock', () => {
    it('acquires a free lock, runs the callback, releases the lock, and publishes the release', async () => {
      const { service, pubsub, lockRepository } = makeService();
      lockRepository.findOne.mockResolvedValue(null);
      const cb = jest.fn().mockResolvedValue('done');

      const result = await service.acquireLock('name-1', cb);

      expect(result).toBe('done');
      expect(lockRepository.insert).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'name-1', isLocked: true, clock: '0' }),
      );
      expect(cb).toHaveBeenCalledTimes(1);
      expect(lockRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'name-1' }),
        { isLocked: false },
      );
      expect(pubsub.publish).toHaveBeenCalledWith(getChannel('name-1'), 'name-1');
    });

    it('reacquires a stale (expired) lock by bumping its clock', async () => {
      const { service, lockRepository } = makeService();
      lockRepository.findOne.mockResolvedValue({
        id: 1,
        isLocked: true,
        expiresAt: new Date(Date.now() - 1000),
        clock: '3',
      });
      const cb = jest.fn().mockResolvedValue('done');

      await service.acquireLock('name-expired', cb);

      expect(lockRepository.update).toHaveBeenCalledWith(
        { id: 1, clock: '3' },
        expect.objectContaining({ isLocked: true, clock: '4' }),
      );
    });

    it('propagates the callback result even when releasing the lock fails', async () => {
      const { service, pubsub, lockRepository } = makeService();
      lockRepository.findOne.mockResolvedValue(null);
      lockRepository.update.mockRejectedValue(new Error('db down'));
      const cb = jest.fn().mockResolvedValue('done');

      const result = await service.acquireLock('name-2', cb);

      expect(result).toBe('done');
      expect(pubsub.publish).toHaveBeenCalledWith(getChannel('name-2'), 'name-2');
    });

    it('propagates a synchronous callback rejection after releasing the lock', async () => {
      const { service, lockRepository } = makeService();
      lockRepository.findOne.mockResolvedValue(null);
      const cb = jest.fn().mockRejectedValue(new Error('callback failed'));

      await expect(service.acquireLock('name-3', cb)).rejects.toThrow('callback failed');
      expect(lockRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'name-3' }),
        { isLocked: false },
      );
    });

    // NOTE: this documents actual (surprising) behavior found while writing
    // these tests, not the intended contract. On contention, `tryAcquire`'s
    // catch branch schedules a retry via
    // `setTimeout(() => acquisitionQueue.add(tryAcquire), RETRY_TIMEOUT)` and
    // then does a bare `return` (undefined) — it never awaits or returns that
    // scheduled retry. Since `acquireInternal` returns the *first*
    // `acquisitionQueue.add(tryAcquire)` call's promise, and that promise is
    // what `acquireLock` hands back to its caller, the caller's awaited
    // `acquireLock(...)` resolves to `undefined` as soon as the first attempt
    // hits contention — well before any retry runs. The retry chain still
    // acquires the lock and invokes the callback internally afterward, but
    // nothing propagates that outcome back to the original caller. Flagging
    // this as a likely bug rather than fixing it (out of scope for this task).
    it('resolves to undefined on the first contended attempt, without surfacing the eventual retry result', async () => {
      jest.useFakeTimers();
      const { service, lockRepository } = makeService();
      lockRepository.findOne
        .mockResolvedValueOnce({
          id: 1,
          isLocked: true,
          ownerId: 'other-owner',
          expiresAt: new Date(Date.now() + 100000),
          clock: '0',
        })
        .mockResolvedValueOnce(null);
      const cb = jest.fn().mockResolvedValue('acquired-after-retry');

      const result = await service.acquireLock('name-contended', cb);

      expect(result).toBeUndefined();
      expect(cb).not.toHaveBeenCalled();
      expect(lockRepository.findOne).toHaveBeenCalledTimes(1);

      // The retry still happens in the background and does go on to acquire
      // the lock and run the callback — it just never reaches the original
      // caller's promise.
      await jest.advanceTimersByTimeAsync(LOCK_CONFIG.RETRY_TIMEOUT);

      expect(lockRepository.findOne).toHaveBeenCalledTimes(2);
      expect(cb).toHaveBeenCalledTimes(1);
      expect(lockRepository.insert).toHaveBeenCalledWith(expect.objectContaining({ name: 'name-contended' }));
    });

    it('throws AlreadyAcquiredError from attemptLockAcquisition when a live lock is held', async () => {
      const { lockRepository } = makeService();
      lockRepository.findOne.mockResolvedValue({
        id: 1,
        isLocked: true,
        ownerId: 'other-owner',
        expiresAt: new Date(Date.now() + 100000),
        clock: '0',
      });

      // Exercise the private method directly to assert the thrown error type
      // without waiting through the retry loop.
      const anyService = new LockService({ subscribe: jest.fn().mockResolvedValue(jest.fn()) } as any, lockRepository);
      await expect((anyService as any).attemptLockAcquisition('name-x', 'owner-x')).rejects.toBeInstanceOf(
        AlreadyAcquiredError,
      );
    });
  });

  describe('onModuleDestroy', () => {
    it('clears and drops all per-name queues', async () => {
      const { service, lockRepository } = makeService();
      lockRepository.findOne.mockResolvedValue(null);
      await service.acquireLock('name-1', jest.fn().mockResolvedValue('done'));
      const queue = (service as any).queues.get('name-1');
      expect(queue).toBeDefined();

      service.onModuleDestroy();

      expect(queue.clear).toHaveBeenCalled();
      expect((service as any).queues.size).toBe(0);
    });
  });
});
