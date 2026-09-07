import { LessThanOrEqual, In } from 'typeorm';
import { PubSubCleanupService } from '../pubsub-cleanup.service';

function makeService() {
  const payloadRepository = {
    find: jest.fn(),
    delete: jest.fn(),
  } as any;
  const service = new PubSubCleanupService(payloadRepository);
  return { service, payloadRepository };
}

describe('PubSubCleanupService', () => {
  describe('cleanupOldPayloads', () => {
    it('deletes payloads older than the TTL in a single batch when under BATCH_SIZE', async () => {
      const { service, payloadRepository } = makeService();
      payloadRepository.find.mockResolvedValueOnce([{ id: 'p1' }, { id: 'p2' }]);
      payloadRepository.delete.mockResolvedValueOnce({ affected: 2 });

      await service.cleanupOldPayloads();

      expect(payloadRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { createdAt: LessThanOrEqual(expect.any(Date)) },
          select: ['id'],
          take: 1000,
        }),
      );
      expect(payloadRepository.delete).toHaveBeenCalledWith({ id: In(['p1', 'p2']) });
    });

    it('pages through multiple full batches until a short batch ends the loop', async () => {
      const { service, payloadRepository } = makeService();
      const fullBatch = Array.from({ length: 1000 }, (_, i) => ({ id: `p${i}` }));
      payloadRepository.find.mockResolvedValueOnce(fullBatch).mockResolvedValueOnce([{ id: 'last' }]);
      payloadRepository.delete.mockResolvedValue({ affected: 1000 }).mockResolvedValueOnce({ affected: 1000 });

      await service.cleanupOldPayloads();

      expect(payloadRepository.find).toHaveBeenCalledTimes(2);
      expect(payloadRepository.delete).toHaveBeenCalledTimes(2);
    });

    it('stops immediately when there is nothing to delete', async () => {
      const { service, payloadRepository } = makeService();
      payloadRepository.find.mockResolvedValueOnce([]);

      await service.cleanupOldPayloads();

      expect(payloadRepository.delete).not.toHaveBeenCalled();
    });

    it('skips a run that is already in progress', async () => {
      const { service, payloadRepository } = makeService();
      let resolveFind: (v: unknown[]) => void;
      payloadRepository.find.mockReturnValueOnce(
        new Promise((resolve) => {
          resolveFind = resolve;
        }),
      );

      const firstRun = service.cleanupOldPayloads();
      const secondRun = service.cleanupOldPayloads();

      resolveFind!([]);
      await Promise.all([firstRun, secondRun]);

      expect(payloadRepository.find).toHaveBeenCalledTimes(1);
    });

    it('does not throw when the repository errors, and clears the running flag', async () => {
      const { service, payloadRepository } = makeService();
      payloadRepository.find.mockRejectedValueOnce(new Error('db down'));

      await expect(service.cleanupOldPayloads()).resolves.toBeUndefined();

      // a subsequent run should be allowed since isRunning was reset in the finally block
      payloadRepository.find.mockResolvedValueOnce([]);
      await service.cleanupOldPayloads();
      expect(payloadRepository.find).toHaveBeenCalledTimes(2);
    });
  });

  describe('triggerCleanup', () => {
    it('returns the total number of deleted rows across batches', async () => {
      const { service, payloadRepository } = makeService();
      payloadRepository.find.mockResolvedValueOnce([{ id: 'p1' }]).mockResolvedValueOnce([]);
      payloadRepository.delete.mockResolvedValueOnce({ affected: 1 });

      const result = await service.triggerCleanup();

      expect(result).toEqual({ deleted: 1 });
    });

    it('treats an undefined affected count as zero deletions', async () => {
      const { service, payloadRepository } = makeService();
      payloadRepository.find.mockResolvedValueOnce([{ id: 'p1' }]);
      payloadRepository.delete.mockResolvedValueOnce({ affected: undefined });

      const result = await service.triggerCleanup();

      expect(result).toEqual({ deleted: 0 });
    });
  });

  describe('onModuleDestroy', () => {
    it('resolves immediately when no cleanup is in progress', async () => {
      const { service } = makeService();

      await expect(service.onModuleDestroy()).resolves.toBeUndefined();
    });

    it('waits for an in-progress cleanup to finish before resolving', async () => {
      const { service, payloadRepository } = makeService();
      let resolveFind: (v: unknown[]) => void;
      payloadRepository.find.mockReturnValueOnce(
        new Promise((resolve) => {
          resolveFind = resolve;
        }),
      );

      const runPromise = service.cleanupOldPayloads();
      const destroyPromise = service.onModuleDestroy();

      let destroyed = false;
      destroyPromise.then(() => (destroyed = true));

      // give the destroy loop a chance to poll — should still be waiting
      await new Promise((resolve) => setImmediate(resolve));
      expect(destroyed).toBe(false);

      resolveFind!([]);
      await runPromise;
      await destroyPromise;

      expect(destroyed).toBe(true);
    });
  });
});
