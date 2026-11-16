// The notebook run service drags in the editor and the document executors (an
// ESM-only dependency); the tests hand the service a fake of it anyway.
jest.mock('../../notebook-blocks/notebook-run.service', () => ({ NotebookRunService: jest.fn() }));
jest.mock('../../staff/staff.service', () => ({ StaffService: jest.fn() }));

import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { TerminalTeamService } from '../terminal-team.service';

const STAFF = 'staff-1';
const CLIENT = 'client-1';
const PAYCREST = 'doc-paycrest';
const FEES = 'doc-fees';

// A query builder that answers with `raw` whichever way it is chained.
function builder(raw: unknown) {
  const chain: Record<string, jest.Mock> = {};
  for (const method of ['select', 'addSelect', 'where', 'andWhere', 'groupBy']) {
    chain[method] = jest.fn(() => chain);
  }
  chain.getRawMany = jest.fn(async () => raw);
  chain.getRawOne = jest.fn(async () => raw);
  return chain;
}

function setup({ isStaff = true } = {}) {
  const client = {
    id: CLIENT,
    name: 'Acme',
    type: 'exchange',
    plan: 'pro',
    status: 'live',
    website: 'https://acme.test',
    description: 'A wallet',
    researchAllowance: 5,
    createdAt: new Date('2026-09-01T00:00:00Z'),
  };
  const repos = {
    clients: { findOneBy: jest.fn(async () => client) },
    invites: { findOne: jest.fn(async () => ({ email: 'admin@acme.test' })) },
    members: {
      count: jest.fn(async () => 3),
      createQueryBuilder: jest.fn(() => builder({ at: new Date('2026-11-05T09:00:00Z') })),
    },
    briefing: {
      createQueryBuilder: jest.fn(() =>
        builder([{ documentId: PAYCREST, items: '3', cells: '2', lastRanAt: new Date('2026-11-04T06:00:00Z') }]),
      ),
    },
    signals: {
      count: jest.fn(async () => 4),
      find: jest.fn(async () => [{ documentId: FEES }, { documentId: PAYCREST }]),
    },
    subjects: { find: jest.fn(async () => []) },
    requests: { count: jest.fn(async () => 2) },
    documents: {
      find: jest.fn(async () => [
        { id: FEES, title: 'Fees by route', workspaceId: 'ws-1', slug: null },
        { id: PAYCREST, title: 'Paycrest payouts', workspaceId: 'ws-1', slug: 'paycrest' },
      ]),
      findOneBy: jest.fn(async ({ id }: { id: string }) => ({ id, workspaceId: 'ws-1' })),
    },
    schedules: {
      find: jest.fn(async () => [
        {
          documentId: PAYCREST,
          isActive: true,
          nextExecutionAt: new Date('2026-11-09T06:00:00Z'),
          lastExecutedAt: new Date('2026-11-08T06:00:00Z'),
        },
      ]),
    },
  };
  const staff = {
    assertStaff: jest.fn(async () => {
      if (!isStaff) throw new ForbiddenException('staff only');
    }),
    isStaff: jest.fn(),
  };
  const runs = { start: jest.fn() };
  const service = new TerminalTeamService(
    repos.clients as any,
    repos.invites as any,
    repos.members as any,
    repos.briefing as any,
    repos.signals as any,
    repos.subjects as any,
    repos.requests as any,
    repos.documents as any,
    repos.schedules as any,
    {} as any,
    staff as any,
    runs as any,
  );
  return { service, repos, staff, runs };
}

describe('TerminalTeamService.getClient', () => {
  it('is for staff only', async () => {
    const { service, repos } = setup({ isStaff: false });

    await expect(service.getClient('someone', CLIENT)).rejects.toThrow(ForbiddenException);
    expect(repos.clients.findOneBy).not.toHaveBeenCalled();
  });

  it('answers 404 for a client that does not exist', async () => {
    const { service, repos } = setup();
    repos.clients.findOneBy.mockResolvedValueOnce(null as any);

    await expect(service.getClient(STAFF, CLIENT)).rejects.toThrow(NotFoundException);
  });

  it('gathers who reads, what is open and the notebooks it is built from', async () => {
    const { service } = setup();

    const detail = await service.getClient(STAFF, CLIENT);

    expect(detail).toMatchObject({
      id: CLIENT,
      name: 'Acme',
      adminEmail: 'admin@acme.test',
      members: 3,
      lastReadAt: '2026-11-05T09:00:00.000Z',
      openRequests: 2,
      newSignals: 4,
      researchAllowance: 5,
    });
  });

  it('lists each notebook once, newest run first, with its cells, items and schedule', async () => {
    const { service } = setup();

    const { sources } = await service.getClient(STAFF, CLIENT);

    expect(sources.map(source => source.documentId)).toEqual([PAYCREST, FEES]);
    expect(sources[0]).toEqual({
      documentId: PAYCREST,
      title: 'Paycrest payouts',
      path: '/notebooks/paycrest',
      cells: 2,
      items: 4, // 3 briefing items and 1 signal
      lastRanAt: '2026-11-04T06:00:00.000Z',
      schedule: { isActive: true, nextRunAt: '2026-11-09T06:00:00.000Z', lastRunAt: '2026-11-08T06:00:00.000Z' },
    });
    expect(sources[1]).toMatchObject({ documentId: FEES, path: '/workspace/ws-1/documents/doc-fees', cells: 0, items: 1, lastRanAt: null, schedule: null });
  });

  it('has no sources for a client that nothing links to a notebook yet', async () => {
    const { service, repos } = setup();
    repos.briefing.createQueryBuilder.mockReturnValueOnce(builder([]));
    repos.signals.find.mockResolvedValueOnce([]);

    const detail = await service.getClient(STAFF, CLIENT);

    expect(detail.sources).toEqual([]);
    expect(repos.documents.find).not.toHaveBeenCalled();
  });
});

describe('TerminalTeamService.runSource', () => {
  const report = (cells: { title: string; kind: string; state: string; error?: { message: string } }[]) => ({
    status: 'idle' as const,
    counts: {},
    cells,
  });

  it('is for staff only', async () => {
    const { service, runs } = setup({ isStaff: false });

    await expect(service.runSource('someone', CLIENT, PAYCREST)).rejects.toThrow(ForbiddenException);
    expect(runs.start).not.toHaveBeenCalled();
  });

  it('refuses a notebook that does not feed the client', async () => {
    const { service, runs } = setup();

    await expect(service.runSource(STAFF, CLIENT, 'doc-someone-elses')).rejects.toThrow(NotFoundException);
    expect(runs.start).not.toHaveBeenCalled();
  });

  it('runs the notebook as the staff member in its own workspace', async () => {
    const { service, runs } = setup();
    runs.start.mockResolvedValue(report([{ title: 'Load', kind: 'python', state: 'success' }]));

    await service.runSource(STAFF, CLIENT, PAYCREST);

    expect(runs.start).toHaveBeenCalledWith(
      { userId: STAFF, workspaceId: 'ws-1', documentId: PAYCREST },
      { waitSeconds: expect.any(Number) },
    );
  });

  it('counts the cells that ran and names the ones that failed', async () => {
    const { service, runs } = setup();
    runs.start.mockResolvedValue(
      report([
        { title: 'Intro', kind: 'markdown', state: 'not_run' },
        { title: 'Load', kind: 'python', state: 'success' },
        { title: '', kind: 'sql', state: 'error', error: { message: 'relation "x" does not exist' } },
        { title: 'Chart', kind: 'python', state: 'aborted' },
      ]),
    );

    const run = await service.runSource(STAFF, CLIENT, PAYCREST);

    expect(run).toEqual({
      status: 'idle',
      cells: 3,
      failed: [
        { title: 'sql', message: 'relation "x" does not exist' },
        { title: 'Chart', message: 'Stopped before it finished' },
      ],
    });
  });

  it('passes on the refusal when the staff member cannot edit that notebook', async () => {
    const { service, runs } = setup();
    runs.start.mockRejectedValue(new ForbiddenException('You cannot edit this workspace'));

    await expect(service.runSource(STAFF, CLIENT, PAYCREST)).rejects.toThrow('You cannot edit this workspace');
  });
});
