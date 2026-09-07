// YjsDocumentService transitively drags in DocumentExecutorService -> the
// visualization block executor -> an ESM-only dependency (aggregate-error);
// stub it via an explicit factory so jest never loads the real module chain.
jest.mock('@/features/collaboration/yjs/yjs-document.service', () => ({
  YjsDocumentService: jest.fn(),
}));

const cronJobInstances: any[] = [];

jest.mock('cron', () => ({
  CronJob: {
    from: jest.fn((opts: any) => {
      const instance = {
        opts,
        stop: jest.fn(),
      };
      cronJobInstances.push(instance);
      return instance;
    }),
  },
}));

// Only executeNotebook touches @sandworm/editor, and only to orchestrate
// (load doc, enqueueRunAll, waitForCompletion) — stub it so tests target
// that orchestration instead of re-testing ExecutionQueue's own behavior
// (already covered in packages/editor and the sql-block-executor specs).
const enqueueRunAll = jest.fn();
jest.mock('@sandworm/editor', () => ({
  getBlocks: jest.fn(() => 'blocks'),
  getLayout: jest.fn(() => 'layout'),
  ExecutionQueue: {
    fromYjs: jest.fn(() => ({ enqueueRunAll })),
  },
}));

import { ExecutionScheduleType } from '@sandworm/postgresql-typeorm';
import { ScheduleExecutorService } from '../schedule-executor.service';

function makeService() {
  const scheduleRepository = {
    find: jest.fn(),
    update: jest.fn(),
  } as any;
  const documentRepository = {
    findOne: jest.fn(),
  } as any;
  const yjsAppRepository = {
    findOne: jest.fn(),
  } as any;
  const lockService = {
    acquireLock: jest.fn((_name: string, cb: () => Promise<void>) => cb()),
  } as any;
  const yjsDocumentService = {
    getYDoc: jest.fn(),
  } as any;
  const persistor = { name: 'stub-persistor' };
  const persistorFactory = {
    getDocId: jest.fn((documentId: string, app: { id: string; userId: string | null } | null) =>
      app ? `${documentId}-${app.id}-${app.userId}` : `${documentId}-null`,
    ),
    createAppPersistor: jest.fn().mockReturnValue(persistor),
  } as any;

  const service = new ScheduleExecutorService(
    scheduleRepository,
    documentRepository,
    yjsAppRepository,
    lockService,
    yjsDocumentService,
    persistorFactory,
  );

  return {
    service,
    scheduleRepository,
    documentRepository,
    yjsAppRepository,
    lockService,
    yjsDocumentService,
    persistorFactory,
    persistor,
  };
}

describe('ScheduleExecutorService', () => {
  beforeEach(() => {
    cronJobInstances.length = 0;
  });

  describe('convertToCron', () => {
    it('builds an HOURLY cron from minute', () => {
      const { service } = makeService();
      const cron = (service as any).convertToCron({ type: ExecutionScheduleType.HOURLY, minute: 15 });
      expect(cron).toBe('0 15 * * * *');
    });

    it('builds a DAILY cron from hour and minute', () => {
      const { service } = makeService();
      const cron = (service as any).convertToCron({ type: ExecutionScheduleType.DAILY, hour: 9, minute: 30 });
      expect(cron).toBe('0 30 9 * * *');
    });

    it('builds a WEEKLY cron, normalizing weekdays modulo 7', () => {
      const { service } = makeService();
      const cron = (service as any).convertToCron({
        type: ExecutionScheduleType.WEEKLY,
        hour: 9,
        minute: 0,
        weekdays: '0,7',
      });
      expect(cron).toBe('0 0 9 * * 0,0');
    });

    it('builds a MONTHLY cron, shifting days by +1', () => {
      const { service } = makeService();
      const cron = (service as any).convertToCron({
        type: ExecutionScheduleType.MONTHLY,
        hour: 9,
        minute: 0,
        days: '0,14',
      });
      expect(cron).toBe('0 0 9 1,15 * *');
    });

    it('passes a CRON schedule expression through as-is', () => {
      const { service } = makeService();
      const cron = (service as any).convertToCron({ type: ExecutionScheduleType.CRON, cron: '0 0 * * * *' });
      expect(cron).toBe('0 0 * * * *');
    });

    it('throws for an unknown schedule type', () => {
      const { service } = makeService();
      expect(() => (service as any).convertToCron({ type: 'bogus' })).toThrow('Unknown schedule type: bogus');
    });
  });

  describe('syncSchedules', () => {
    it('creates a cron job for a new active schedule', async () => {
      const { service, scheduleRepository } = makeService();
      scheduleRepository.find.mockResolvedValue([
        { id: 'sched-1', type: ExecutionScheduleType.HOURLY, minute: 0, documentId: 'doc-1', timezone: 'UTC' },
      ]);

      await (service as any).syncSchedules();

      expect(scheduleRepository.find).toHaveBeenCalledWith({ where: { isActive: true } });
      expect(cronJobInstances).toHaveLength(1);
      expect(cronJobInstances[0].opts).toMatchObject({
        cronTime: '0 0 * * * *',
        start: true,
        timeZone: 'UTC',
        context: 'doc-1',
      });
      expect((service as any).jobs.get('sched-1').cron).toBe('0 0 * * * *');
    });

    it('leaves an unchanged schedule alone on a subsequent sync', async () => {
      const { service, scheduleRepository } = makeService();
      const schedule = { id: 'sched-1', type: ExecutionScheduleType.HOURLY, minute: 0, documentId: 'doc-1', timezone: 'UTC' };
      scheduleRepository.find.mockResolvedValue([schedule]);

      await (service as any).syncSchedules();
      const firstJob = cronJobInstances[0];
      await (service as any).syncSchedules();

      expect(cronJobInstances).toHaveLength(1);
      expect(firstJob.stop).not.toHaveBeenCalled();
    });

    it('stops the old job and creates a new one when a schedule changes', async () => {
      const { service, scheduleRepository } = makeService();
      scheduleRepository.find.mockResolvedValue([
        { id: 'sched-1', type: ExecutionScheduleType.HOURLY, minute: 0, documentId: 'doc-1', timezone: 'UTC' },
      ]);
      await (service as any).syncSchedules();
      const firstJob = cronJobInstances[0];

      scheduleRepository.find.mockResolvedValue([
        { id: 'sched-1', type: ExecutionScheduleType.HOURLY, minute: 30, documentId: 'doc-1', timezone: 'UTC' },
      ]);
      await (service as any).syncSchedules();

      expect(firstJob.stop).toHaveBeenCalledTimes(1);
      expect(cronJobInstances).toHaveLength(2);
      expect((service as any).jobs.get('sched-1').cron).toBe('0 30 * * * *');
    });

    it('stops and removes jobs for schedules no longer active', async () => {
      const { service, scheduleRepository } = makeService();
      scheduleRepository.find.mockResolvedValue([
        { id: 'sched-1', type: ExecutionScheduleType.HOURLY, minute: 0, documentId: 'doc-1', timezone: 'UTC' },
      ]);
      await (service as any).syncSchedules();
      const firstJob = cronJobInstances[0];

      scheduleRepository.find.mockResolvedValue([]);
      await (service as any).syncSchedules();

      expect(firstJob.stop).toHaveBeenCalledTimes(1);
      expect((service as any).jobs.has('sched-1')).toBe(false);
    });

    it('logs and skips a schedule whose cron cannot be built, without touching the others', async () => {
      const { service, scheduleRepository } = makeService();
      scheduleRepository.find.mockResolvedValue([
        { id: 'bad', type: 'bogus', documentId: 'doc-1', timezone: 'UTC' },
        { id: 'good', type: ExecutionScheduleType.HOURLY, minute: 0, documentId: 'doc-2', timezone: 'UTC' },
      ]);

      await (service as any).syncSchedules();

      expect((service as any).jobs.has('bad')).toBe(false);
      expect((service as any).jobs.has('good')).toBe(true);
    });
  });

  describe('executeScheduleInternal', () => {
    it('records lastExecutedAt and skips execution when the document is missing', async () => {
      const { service, scheduleRepository, documentRepository } = makeService();
      documentRepository.findOne.mockResolvedValue(null);
      const warnSpy = jest.spyOn((service as any).logger, 'warn').mockImplementation(() => {});

      await (service as any).executeScheduleInternal({ id: 'sched-1', documentId: 'doc-1' });

      expect(scheduleRepository.update).toHaveBeenCalledWith('sched-1', { lastExecutedAt: expect.any(Date) });
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('not found'));
    });

    it('skips execution when the document is soft-deleted', async () => {
      const { service, documentRepository } = makeService();
      documentRepository.findOne.mockResolvedValue({ id: 'doc-1', deletedAt: new Date() });
      const executeDocumentSpy = jest.spyOn(service as any, 'executeDocument');

      await (service as any).executeScheduleInternal({ id: 'sched-1', documentId: 'doc-1' });

      expect(executeDocumentSpy).not.toHaveBeenCalled();
    });

    it('runs executeDocument for an active, non-deleted document', async () => {
      const { service, documentRepository, yjsAppRepository, yjsDocumentService, persistor } = makeService();
      documentRepository.findOne.mockResolvedValue({ id: 'doc-1', workspaceId: 'ws-1', deletedAt: null });
      yjsAppRepository.findOne.mockResolvedValue({ id: 'yjs-1', documentId: 'doc-1' });
      yjsDocumentService.getYDoc.mockResolvedValue({ ydoc: {} });
      enqueueRunAll.mockReturnValue({ waitForCompletion: jest.fn().mockResolvedValue(null) });

      await (service as any).executeScheduleInternal({ id: 'sched-1', documentId: 'doc-1' });

      expect(yjsAppRepository.findOne).toHaveBeenCalledWith({
        where: { documentId: 'doc-1' },
        order: { createdAt: 'DESC' },
      });
      expect(yjsDocumentService.getYDoc).toHaveBeenCalledWith('doc-1-yjs-1-null', 'doc-1', 'ws-1', persistor);
    });
  });

  describe('executeNotebook', () => {
    it('loads the app doc, enqueues a schedule-tagged run-all, and resolves on success', async () => {
      const { service, yjsDocumentService, persistorFactory, persistor } = makeService();
      const ydoc = {};
      yjsDocumentService.getYDoc.mockResolvedValue({ ydoc });
      const waitForCompletion = jest.fn().mockResolvedValue(null);
      enqueueRunAll.mockReturnValue({ waitForCompletion });

      await (service as any).executeNotebook(
        'sched-1',
        { id: 'doc-1', workspaceId: 'ws-1' },
        { id: 'yjs-1' },
      );

      expect(persistorFactory.createAppPersistor).toHaveBeenCalledWith('doc-1', 'yjs-1', null);
      expect(yjsDocumentService.getYDoc).toHaveBeenCalledWith('doc-1-yjs-1-null', 'doc-1', 'ws-1', persistor);
      expect(enqueueRunAll).toHaveBeenCalledWith('layout', 'blocks', { _tag: 'schedule', scheduleId: 'sched-1' });
      expect(waitForCompletion).toHaveBeenCalled();
    });

    it('throws when the run-all batch fails on a block', async () => {
      const { service, yjsDocumentService } = makeService();
      yjsDocumentService.getYDoc.mockResolvedValue({ ydoc: {} });
      enqueueRunAll.mockReturnValue({ waitForCompletion: jest.fn().mockResolvedValue('block-1') });

      await expect(
        (service as any).executeNotebook('sched-1', { id: 'doc-1', workspaceId: 'ws-1' }, { id: 'yjs-1' }),
      ).rejects.toThrow('Run-all for document doc-1 failed on block block-1');
    });

    it('logs and swallows an error raised while executing the document', async () => {
      const { service, documentRepository, yjsAppRepository } = makeService();
      documentRepository.findOne.mockResolvedValue({ id: 'doc-1', deletedAt: null });
      yjsAppRepository.findOne.mockResolvedValue(null);
      const errorSpy = jest.spyOn((service as any).logger, 'error').mockImplementation(() => {});

      await expect(
        (service as any).executeScheduleInternal({ id: 'sched-1', documentId: 'doc-1' }),
      ).resolves.toBeUndefined();

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed execution for document doc-1'),
        expect.any(Error),
      );
    });
  });

  describe('executeSchedule', () => {
    it('tracks the run in `running` and removes it on completion', async () => {
      const { service, documentRepository } = makeService();
      documentRepository.findOne.mockResolvedValue(null);
      jest.spyOn((service as any).logger, 'warn').mockImplementation(() => {});

      const promise = (service as any).executeSchedule({ id: 'sched-1', documentId: 'doc-1' });

      expect((service as any).running.has('sched-1')).toBe(true);
      await promise;
      expect((service as any).running.has('sched-1')).toBe(false);
    });
  });

  describe('onModuleDestroy', () => {
    it('stops all cron jobs and waits for in-flight runs before returning', async () => {
      const { service } = makeService();
      let resolveRun!: () => void;
      const runningPromise = new Promise<void>((resolve) => {
        resolveRun = resolve;
      });
      const job = { stop: jest.fn() };
      (service as any).jobs.set('sched-1', { job, cron: '0 0 * * * *' });
      (service as any).running.set('sched-1', runningPromise);
      (service as any).lockAcquired = false;

      const destroyPromise = service.onModuleDestroy();
      // Give the shutdown loop a tick to observe the still-pending run.
      await Promise.resolve();
      expect(job.stop).toHaveBeenCalledTimes(1);

      (service as any).running.delete('sched-1');
      resolveRun();
      await destroyPromise;
    });
  });
});
