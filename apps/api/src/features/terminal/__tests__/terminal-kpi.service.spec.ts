jest.mock('../../staff/staff.service', () => ({ StaffService: jest.fn() }));

import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { KpiDirection, KpiFormatKind } from '@sandworm/types/terminal';
import { TerminalKpiService } from '../terminal-kpi.service';

const STAFF = 'staff-1';
const USER = 'user-1';
const CLIENT = 'client-1';
const DAY = 24 * 60 * 60 * 1000;

const definition = (init: Record<string, unknown> = {}) => ({
  id: 'kpi-1',
  clientId: CLIENT,
  subjectId: null,
  key: 'swap-volume',
  label: 'Swap volume',
  description: '',
  position: 0,
  isVisible: true,
  format: { kind: KpiFormatKind.CURRENCY, currency: 'USD', compact: true },
  direction: KpiDirection.UP_GOOD,
  comparison: { kind: 'previous' },
  source: { kind: 'manual' },
  settings: {},
  ...init,
});

const row = (kpiId: string, daysAgo: number, value: number) => ({
  kpiId,
  asOf: new Date(Date.now() - daysAgo * DAY),
  value,
  textValue: null,
  previous: null,
});

function setup({ isStaff = true, member = true } = {}) {
  const repos = {
    kpis: {
      find: jest.fn(async () => [definition()] as any[]),
      findOne: jest.fn(async () => null as any),
      findOneBy: jest.fn(async () => definition() as any),
      create: jest.fn((data: object) => ({ ...data }) as any),
      save: jest.fn(async (kpi: object) => ({ id: 'kpi-new', ...kpi }) as any),
      delete: jest.fn(async () => ({ affected: 1 })),
    },
    values: {
      find: jest.fn(async () => [row('kpi-1', 0, 1_820_000_000), row('kpi-1', 30, 2_000_000_000)] as any[]),
      upsert: jest.fn(async () => undefined),
    },
    members: { findOne: jest.fn(async () => (member ? { clientId: CLIENT } : null)) },
    clients: {
      findOneBy: jest.fn(async () => ({ id: CLIENT, type: 'exchange', status: 'live' })),
      exist: jest.fn(async () => true),
      update: jest.fn(async () => undefined),
    },
  };
  const staff = {
    assertStaff: jest.fn(async () => {
      if (!isStaff) throw new ForbiddenException('staff only');
    }),
  };
  const service = new TerminalKpiService(
    repos.kpis as any,
    repos.values as any,
    repos.members as any,
    repos.clients as any,
    staff as any,
  );
  return { service, repos, staff };
}

describe('TerminalKpiService.overview', () => {
  it('is null for someone who is not part of a client', async () => {
    const { service } = setup({ member: false });

    expect(await service.overview(USER)).toBeNull();
  });

  it("works the client's visible key numbers out from their readings, in order", async () => {
    const { service, repos } = setup();

    const overview = await service.overview(USER);

    expect(repos.kpis.find).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ clientId: CLIENT, isVisible: true }), order: expect.objectContaining({ position: 'ASC' }) }),
    );
    expect(overview).toEqual({
      clientType: 'exchange',
      clientStatus: 'live',
      isUpdating: false,
      kpis: [
        {
          id: 'swap-volume',
          label: 'Swap volume',
          value: '$1.82B',
          delta: { text: '▼ 9%', tone: 'negative' },
          comparison: 'vs last month',
        },
      ],
    });
  });

  it('is updating from when the client changed what it tracks, until the next reading', async () => {
    const { service, repos } = setup();
    repos.clients.findOneBy.mockResolvedValueOnce({ id: CLIENT, type: 'exchange', status: 'live', trackingChangedAt: new Date() } as any);

    expect((await service.overview(USER))?.isUpdating).toBe(true);

    await service.recordValue(STAFF, 'kpi-1', { value: 1 });

    expect(repos.clients.update).toHaveBeenCalledWith({ id: CLIENT }, { trackingChangedAt: null });
  });

  it('shows a dash for a key number with no readings yet, and has none for a client with no key numbers', async () => {
    const { service, repos } = setup();
    repos.values.find.mockResolvedValueOnce([]);

    expect((await service.overview(USER))?.kpis[0]).toEqual({ id: 'swap-volume', label: 'Swap volume', value: '—' });

    repos.kpis.find.mockResolvedValueOnce([]);
    expect((await service.overview(USER))?.kpis).toEqual([]);
  });
});

describe('TerminalKpiService.clientKpis', () => {
  it('is for staff only', async () => {
    const { service, repos } = setup({ isStaff: false });

    await expect(service.clientKpis('someone', CLIENT)).rejects.toThrow(ForbiddenException);
    expect(repos.kpis.find).not.toHaveBeenCalled();
  });

  it('gives the definition with how it reads now, hidden key numbers included', async () => {
    const { service, repos } = setup();
    repos.kpis.find.mockResolvedValueOnce([definition({ isVisible: false })]);

    const [kpi] = await service.clientKpis(STAFF, CLIENT);

    expect(repos.kpis.find).toHaveBeenCalledWith(expect.objectContaining({ where: { clientId: CLIENT } }));
    expect(kpi).toMatchObject({ key: 'swap-volume', isVisible: false, format: { kind: 'currency' }, display: { value: '$1.82B' } });
    expect(kpi?.lastReadingAt).toEqual(expect.any(String));
  });
});

describe('TerminalKpiService.saveKpi', () => {
  it('is for staff only', async () => {
    const { service, repos } = setup({ isStaff: false });

    await expect(service.saveKpi('someone', CLIENT, { key: 'x', label: 'X' })).rejects.toThrow(ForbiddenException);
    expect(repos.kpis.save).not.toHaveBeenCalled();
  });

  it('refuses a key that is not lowercase letters, numbers and dashes', async () => {
    const { service } = setup();

    await expect(service.saveKpi(STAFF, CLIENT, { key: 'Swap Volume', label: 'X' })).rejects.toThrow(BadRequestException);
    await expect(service.saveKpi(STAFF, CLIENT, { key: '', label: 'X' })).rejects.toThrow(BadRequestException);
  });

  it('answers 404 for a client that does not exist', async () => {
    const { service, repos } = setup();
    repos.clients.exist.mockResolvedValueOnce(false);

    await expect(service.saveKpi(STAFF, CLIENT, { key: 'x', label: 'X' })).rejects.toThrow(NotFoundException);
  });

  it('starts a new key number from the defaults', async () => {
    const { service, repos } = setup();

    await service.saveKpi(STAFF, CLIENT, { key: 'active-wallets', label: 'Active wallets' });

    expect(repos.kpis.save).toHaveBeenCalledWith(
      expect.objectContaining({
        clientId: CLIENT,
        subjectId: null,
        key: 'active-wallets',
        label: 'Active wallets',
        format: { kind: 'number' },
        comparison: { kind: 'previous' },
        source: { kind: 'manual' },
        settings: {},
      }),
    );
  });

  it('needs a label for a new key number, but not to change an existing one', async () => {
    const { service, repos } = setup();

    await expect(service.saveKpi(STAFF, CLIENT, { key: 'new-one' })).rejects.toThrow('needs a label');

    repos.kpis.findOne.mockResolvedValueOnce(definition());
    await expect(service.saveKpi(STAFF, CLIENT, { key: 'swap-volume', isVisible: false })).resolves.toMatchObject({ isVisible: false });
  });

  it('changes only what is sent', async () => {
    const { service, repos } = setup();
    repos.kpis.findOne.mockResolvedValueOnce(definition());

    await service.saveKpi(STAFF, CLIENT, { key: 'swap-volume', direction: 'down_good', comparison: { kind: 'year_ago' } });

    expect(repos.kpis.save).toHaveBeenCalledWith(
      expect.objectContaining({
        label: 'Swap volume',
        direction: 'down_good',
        comparison: { kind: 'year_ago' },
        format: { kind: 'currency', currency: 'USD', compact: true },
      }),
    );
  });

  it('says what is wrong with a format, comparison, source or direction it cannot use', async () => {
    const { service, repos } = setup();

    await expect(service.saveKpi(STAFF, CLIENT, { key: 'x', label: 'X', format: { kind: 'emoji' } })).rejects.toThrow(/format: .*kind/);
    await expect(service.saveKpi(STAFF, CLIENT, { key: 'x', label: 'X', comparison: { kind: 'target' } })).rejects.toThrow(/comparison: /);
    await expect(service.saveKpi(STAFF, CLIENT, { key: 'x', label: 'X', source: { kind: 'notebook' } })).rejects.toThrow(/source: /);
    await expect(service.saveKpi(STAFF, CLIENT, { key: 'x', label: 'X', direction: 'sideways' })).rejects.toThrow(/direction is one of/);
    expect(repos.kpis.save).not.toHaveBeenCalled();
  });
});

describe('TerminalKpiService.recordValue', () => {
  it('is for staff only', async () => {
    const { service, repos } = setup({ isStaff: false });

    await expect(service.recordValue('someone', 'kpi-1', { value: 1 })).rejects.toThrow(ForbiddenException);
    expect(repos.values.upsert).not.toHaveBeenCalled();
  });

  it('answers 404 for a key number that does not exist', async () => {
    const { service, repos } = setup();
    repos.kpis.findOneBy.mockResolvedValueOnce(null);

    await expect(service.recordValue(STAFF, 'nope', { value: 1 })).rejects.toThrow(NotFoundException);
  });

  it('needs a number or words, and a date it can read', async () => {
    const { service } = setup();

    await expect(service.recordValue(STAFF, 'kpi-1', {})).rejects.toThrow('Send a value or a textValue');
    await expect(service.recordValue(STAFF, 'kpi-1', { value: 1, asOf: 'last tuesday-ish' })).rejects.toThrow('not a date');
  });

  it("records the reading for today unless told a date, replacing that date's", async () => {
    const { service, repos } = setup();

    await service.recordValue(STAFF, 'kpi-1', { value: 1_900_000_000, previous: 2_000_000_000 });

    const [row, conflict] = repos.values.upsert.mock.calls[0] as unknown as [Record<string, any>, string[]];
    expect(conflict).toEqual(['kpiId', 'asOf']);
    expect(row).toMatchObject({ kpiId: 'kpi-1', value: 1_900_000_000, previous: 2_000_000_000, textValue: null, recordedBy: STAFF });
    expect(row.asOf.toISOString()).toBe(new Date(new Date().setUTCHours(0, 0, 0, 0)).toISOString());
  });

  it('keeps a reading that is words', async () => {
    const { service, repos } = setup();

    await service.recordValue(STAFF, 'kpi-1', { textValue: '  Strong ', asOf: '2026-11-02T00:00:00Z' });

    expect((repos.values.upsert.mock.calls as unknown as unknown[][])[0]?.[0]).toMatchObject({ value: null, textValue: 'Strong', asOf: new Date('2026-11-02T00:00:00Z') });
  });
});

describe('TerminalKpiService.deleteKpi', () => {
  it('is for staff only, and answers 404 for one that is gone', async () => {
    const denied = setup({ isStaff: false });
    await expect(denied.service.deleteKpi('someone', 'kpi-1')).rejects.toThrow(ForbiddenException);

    const { service, repos } = setup();
    expect(await service.deleteKpi(STAFF, 'kpi-1')).toBe(true);
    repos.kpis.delete.mockResolvedValueOnce({ affected: 0 });
    await expect(service.deleteKpi(STAFF, 'gone')).rejects.toThrow(NotFoundException);
  });
});
