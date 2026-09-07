import { ScheduleResolver } from '../schedule.resolver';

function makeResolver() {
  const scheduleService = {
    getSchedule: jest.fn(),
    listSchedules: jest.fn(),
    createSchedule: jest.fn(),
    updateSchedule: jest.fn(),
    deleteSchedule: jest.fn(),
  } as any;

  const resolver = new ScheduleResolver(scheduleService);

  return { resolver, scheduleService };
}

describe('ScheduleResolver', () => {
  it('getSchedule delegates to the service', async () => {
    const { resolver, scheduleService } = makeResolver();
    scheduleService.getSchedule.mockResolvedValue({ id: 'sched-1' });

    const result = await resolver.getSchedule('sched-1');

    expect(scheduleService.getSchedule).toHaveBeenCalledWith('sched-1');
    expect(result).toEqual({ id: 'sched-1' });
  });

  it('listSchedules delegates to the service', async () => {
    const { resolver, scheduleService } = makeResolver();
    scheduleService.listSchedules.mockResolvedValue([{ id: 'sched-1' }]);

    const result = await resolver.listSchedules({ documentId: 'doc-1' } as any);

    expect(scheduleService.listSchedules).toHaveBeenCalledWith({ documentId: 'doc-1' });
    expect(result).toEqual([{ id: 'sched-1' }]);
  });

  it('createSchedule delegates to the service with workspaceId and input, ignoring the current user id', async () => {
    const { resolver, scheduleService } = makeResolver();
    scheduleService.createSchedule.mockResolvedValue({ id: 'sched-1' });
    const input = { documentId: 'doc-1' } as any;

    const result = await resolver.createSchedule('ws-1', input, 'user-1');

    expect(scheduleService.createSchedule).toHaveBeenCalledWith('ws-1', input);
    expect(result).toEqual({ id: 'sched-1' });
  });

  it('updateSchedule delegates to the service', async () => {
    const { resolver, scheduleService } = makeResolver();
    scheduleService.updateSchedule.mockResolvedValue({ id: 'sched-1', minute: 45 });
    const input = { minute: 45 } as any;

    const result = await resolver.updateSchedule('sched-1', input);

    expect(scheduleService.updateSchedule).toHaveBeenCalledWith('sched-1', input);
    expect(result).toEqual({ id: 'sched-1', minute: 45 });
  });

  it('deleteSchedule delegates to the service', async () => {
    const { resolver, scheduleService } = makeResolver();
    scheduleService.deleteSchedule.mockResolvedValue(true);
    const input = { scheduleId: 'sched-1', documentId: 'doc-1', workspaceId: 'ws-1' };

    const result = await resolver.deleteSchedule(input, 'user-1');

    expect(scheduleService.deleteSchedule).toHaveBeenCalledWith(input);
    expect(result).toBe(true);
  });
});
