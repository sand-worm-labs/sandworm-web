import { ExecutionScheduleType } from '@sandworm/postgresql-typeorm';
import { ValidationException } from '@sandworm/graphql';
import { ScheduleService } from '../schedule.service';

function makeService() {
  const scheduleRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn((v) => v),
    save: jest.fn(),
    delete: jest.fn(),
  } as any;
  const documentRepository = {
    findOne: jest.fn(),
  } as any;

  const service = new ScheduleService(scheduleRepository, documentRepository);

  return { service, scheduleRepository, documentRepository };
}

function getErrorCode(err: unknown): unknown {
  return (err as ValidationException).getResponse();
}

describe('ScheduleService', () => {
  describe('getSchedule', () => {
    it('returns the mapped schedule when found', async () => {
      const { service, scheduleRepository } = makeService();
      scheduleRepository.findOne.mockResolvedValue({
        id: 'sched-1',
        type: ExecutionScheduleType.DAILY,
        hour: 9,
        minute: 30,
        timezone: 'UTC',
        isActive: true,
        documentId: 'doc-1',
      });

      const result = await service.getSchedule('sched-1');

      expect(scheduleRepository.findOne).toHaveBeenCalledWith({ where: { id: 'sched-1' } });
      expect(result).toMatchObject({ id: 'sched-1', hour: 9, minute: 30, documentId: 'doc-1' });
    });

    it('throws a not-found ValidationException when the schedule does not exist', async () => {
      const { service, scheduleRepository } = makeService();
      scheduleRepository.findOne.mockResolvedValue(null);

      await expect(service.getSchedule('missing')).rejects.toThrow(ValidationException);
    });
  });

  describe('listSchedules', () => {
    it('lists schedules for a document ordered by createdAt desc', async () => {
      const { service, scheduleRepository } = makeService();
      scheduleRepository.find.mockResolvedValue([
        { id: 'sched-1', type: ExecutionScheduleType.HOURLY, minute: 0, timezone: 'UTC', isActive: true, documentId: 'doc-1' },
      ]);

      const result = await service.listSchedules({ documentId: 'doc-1' });

      expect(scheduleRepository.find).toHaveBeenCalledWith({
        where: { documentId: 'doc-1' },
        order: { createdAt: 'DESC' },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('getSchedulesByDocument', () => {
    it('delegates to the repository the same way as listSchedules', async () => {
      const { service, scheduleRepository } = makeService();
      scheduleRepository.find.mockResolvedValue([]);

      await service.getSchedulesByDocument('doc-1');

      expect(scheduleRepository.find).toHaveBeenCalledWith({
        where: { documentId: 'doc-1' },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('createSchedule', () => {
    it('throws when the document does not belong to the workspace', async () => {
      const { service, documentRepository } = makeService();
      documentRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createSchedule('ws-1', {
          documentId: 'doc-1',
          type: ExecutionScheduleType.HOURLY,
          minute: 0,
        } as any),
      ).rejects.toThrow(ValidationException);
    });

    it('throws a duplicate-schedule error when an identical schedule already exists', async () => {
      const { service, documentRepository, scheduleRepository } = makeService();
      documentRepository.findOne.mockResolvedValue({ id: 'doc-1', workspaceId: 'ws-1' });
      scheduleRepository.findOne.mockResolvedValue({
        id: 'existing-1',
        type: ExecutionScheduleType.HOURLY,
        minute: 0,
      });

      await expect(
        service.createSchedule('ws-1', {
          documentId: 'doc-1',
          type: ExecutionScheduleType.HOURLY,
          minute: 0,
        } as any),
      ).rejects.toThrow(ValidationException);
      expect(scheduleRepository.save).not.toHaveBeenCalled();
    });

    it('creates and persists a valid HOURLY schedule', async () => {
      const { service, documentRepository, scheduleRepository } = makeService();
      documentRepository.findOne.mockResolvedValue({ id: 'doc-1', workspaceId: 'ws-1' });
      scheduleRepository.findOne.mockResolvedValue(null);
      scheduleRepository.save.mockImplementation(async (s: any) => {
        s.id = 'new-id';
        return s;
      });

      const result = await service.createSchedule('ws-1', {
        documentId: 'doc-1',
        type: ExecutionScheduleType.HOURLY,
        minute: 15,
        timezone: 'UTC',
      } as any);

      expect(scheduleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ documentId: 'doc-1', type: ExecutionScheduleType.HOURLY, minute: 15, isActive: true }),
      );
      expect(scheduleRepository.save).toHaveBeenCalled();
      expect(result.id).toBe('new-id');
    });

    it('rejects an HOURLY schedule missing minute', async () => {
      const { service, documentRepository, scheduleRepository } = makeService();
      documentRepository.findOne.mockResolvedValue({ id: 'doc-1', workspaceId: 'ws-1' });
      scheduleRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createSchedule('ws-1', { documentId: 'doc-1', type: ExecutionScheduleType.HOURLY } as any),
      ).rejects.toThrow(ValidationException);
    });

    it('rejects a DAILY schedule missing hour or minute', async () => {
      const { service, documentRepository, scheduleRepository } = makeService();
      documentRepository.findOne.mockResolvedValue({ id: 'doc-1', workspaceId: 'ws-1' });
      scheduleRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createSchedule('ws-1', { documentId: 'doc-1', type: ExecutionScheduleType.DAILY, hour: 9 } as any),
      ).rejects.toThrow(ValidationException);
    });

    it('rejects a WEEKLY schedule with out-of-range weekdays', async () => {
      const { service, documentRepository, scheduleRepository } = makeService();
      documentRepository.findOne.mockResolvedValue({ id: 'doc-1', workspaceId: 'ws-1' });
      scheduleRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createSchedule('ws-1', {
          documentId: 'doc-1',
          type: ExecutionScheduleType.WEEKLY,
          hour: 9,
          minute: 0,
          weekdays: '1,7',
        } as any),
      ).rejects.toThrow(ValidationException);
    });

    it('accepts a valid WEEKLY schedule', async () => {
      const { service, documentRepository, scheduleRepository } = makeService();
      documentRepository.findOne.mockResolvedValue({ id: 'doc-1', workspaceId: 'ws-1' });
      scheduleRepository.findOne.mockResolvedValue(null);
      scheduleRepository.save.mockImplementation(async (s: any) => s);

      await expect(
        service.createSchedule('ws-1', {
          documentId: 'doc-1',
          type: ExecutionScheduleType.WEEKLY,
          hour: 9,
          minute: 0,
          weekdays: '1,3,5',
        } as any),
      ).resolves.toBeDefined();
    });

    it('rejects a MONTHLY schedule with out-of-range days', async () => {
      const { service, documentRepository, scheduleRepository } = makeService();
      documentRepository.findOne.mockResolvedValue({ id: 'doc-1', workspaceId: 'ws-1' });
      scheduleRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createSchedule('ws-1', {
          documentId: 'doc-1',
          type: ExecutionScheduleType.MONTHLY,
          hour: 9,
          minute: 0,
          days: '31',
        } as any),
      ).rejects.toThrow(ValidationException);
    });

    it('rejects a CRON schedule without a cron expression', async () => {
      const { service, documentRepository, scheduleRepository } = makeService();
      documentRepository.findOne.mockResolvedValue({ id: 'doc-1', workspaceId: 'ws-1' });
      scheduleRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createSchedule('ws-1', { documentId: 'doc-1', type: ExecutionScheduleType.CRON } as any),
      ).rejects.toThrow(ValidationException);
    });

    it('rejects a CRON schedule whose expression does not have 6 parts', async () => {
      const { service, documentRepository, scheduleRepository } = makeService();
      documentRepository.findOne.mockResolvedValue({ id: 'doc-1', workspaceId: 'ws-1' });
      scheduleRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createSchedule('ws-1', {
          documentId: 'doc-1',
          type: ExecutionScheduleType.CRON,
          cron: '* * * *',
        } as any),
      ).rejects.toThrow(ValidationException);
    });

    it('accepts a valid 6-part CRON schedule', async () => {
      const { service, documentRepository, scheduleRepository } = makeService();
      documentRepository.findOne.mockResolvedValue({ id: 'doc-1', workspaceId: 'ws-1' });
      scheduleRepository.findOne.mockResolvedValue(null);
      scheduleRepository.save.mockImplementation(async (s: any) => s);

      await expect(
        service.createSchedule('ws-1', {
          documentId: 'doc-1',
          type: ExecutionScheduleType.CRON,
          cron: '0 0 * * * *',
        } as any),
      ).resolves.toBeDefined();
    });
  });

  describe('updateSchedule', () => {
    it('throws when the schedule does not exist', async () => {
      const { service, scheduleRepository } = makeService();
      scheduleRepository.findOne.mockResolvedValue(null);

      await expect(service.updateSchedule('missing', {} as any)).rejects.toThrow(ValidationException);
    });

    it('applies partial updates and re-validates against the effective type', async () => {
      const { service, scheduleRepository } = makeService();
      const existing = {
        id: 'sched-1',
        type: ExecutionScheduleType.DAILY,
        hour: 9,
        minute: 0,
        timezone: 'UTC',
        isActive: true,
        documentId: 'doc-1',
      };
      scheduleRepository.findOne.mockResolvedValue(existing);
      scheduleRepository.save.mockImplementation(async (s: any) => s);

      const result = await service.updateSchedule('sched-1', { minute: 45 } as any);

      expect(scheduleRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ minute: 45, hour: 9 }),
      );
      expect(result.minute).toBe(45);
    });

    it('rejects an update that would make the schedule invalid for its effective type', async () => {
      const { service, scheduleRepository } = makeService();
      scheduleRepository.findOne.mockResolvedValue({
        id: 'sched-1',
        type: ExecutionScheduleType.WEEKLY,
        hour: 9,
        minute: 0,
        weekdays: '1,2',
        timezone: 'UTC',
        isActive: true,
        documentId: 'doc-1',
      });

      await expect(
        service.updateSchedule('sched-1', { weekdays: '9' } as any),
      ).rejects.toThrow(ValidationException);
      expect(scheduleRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('deleteSchedule', () => {
    it('throws when the schedule cannot be found for the given document', async () => {
      const { service, scheduleRepository } = makeService();
      scheduleRepository.findOne.mockResolvedValue(null);

      await expect(
        service.deleteSchedule({ scheduleId: 'sched-1', documentId: 'doc-1', workspaceId: 'ws-1' }),
      ).rejects.toThrow(ValidationException);
    });

    it('throws Forbidden when the schedule document belongs to a different workspace', async () => {
      const { service, scheduleRepository } = makeService();
      scheduleRepository.findOne.mockResolvedValue({
        id: 'sched-1',
        document: { workspaceId: 'other-ws' },
      });

      await expect(
        service.deleteSchedule({ scheduleId: 'sched-1', documentId: 'doc-1', workspaceId: 'ws-1' }),
      ).rejects.toThrow(ValidationException);
      expect(scheduleRepository.delete).not.toHaveBeenCalled();
    });

    it('deletes the schedule when it belongs to the requesting workspace', async () => {
      const { service, scheduleRepository } = makeService();
      scheduleRepository.findOne.mockResolvedValue({
        id: 'sched-1',
        document: { workspaceId: 'ws-1' },
      });

      const result = await service.deleteSchedule({ scheduleId: 'sched-1', documentId: 'doc-1', workspaceId: 'ws-1' });

      expect(scheduleRepository.delete).toHaveBeenCalledWith({ id: 'sched-1' });
      expect(result).toBe(true);
    });
  });
});
