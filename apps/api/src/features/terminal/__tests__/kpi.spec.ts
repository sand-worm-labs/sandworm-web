import {
  KpiComparison,
  KpiFormat,
  KpiSource,
  buildKpi,
  formatKpiValue,
  type KpiDefinition,
  type KpiReading,
} from '@sandworm/types/terminal';

const DAY = 24 * 60 * 60 * 1000;
const T0 = Date.parse('2026-11-02T00:00:00Z');
const at = (daysBefore: number) => new Date(T0 - daysBefore * DAY).toISOString();

const reading = (daysBefore: number, value: number | null, extra: Partial<KpiReading> = {}): KpiReading => ({
  asOf: at(daysBefore),
  value,
  textValue: null,
  previous: null,
  ...extra,
});

const definition = (init: Partial<KpiDefinition> = {}): KpiDefinition => ({
  key: 'swap-volume',
  label: 'Swap volume',
  format: { kind: 'number' },
  direction: 'up_good',
  comparison: { kind: 'previous' },
  ...init,
});

describe('formatKpiValue', () => {
  it('writes numbers with separators, and compactly when asked', () => {
    expect(formatKpiValue({ kind: 'number' }, 312400)).toBe('312,400');
    expect(formatKpiValue({ kind: 'number', compact: true }, 21900)).toBe('21.9K');
    expect(formatKpiValue({ kind: 'number', decimals: 1 }, 2)).toBe('2.0');
  });

  it('writes currency in the currency asked for, defaulting to dollars', () => {
    expect(formatKpiValue({ kind: 'currency', currency: 'USD', compact: true }, 1_840_000_000)).toBe('$1.84B');
    expect(formatKpiValue({ kind: 'currency' }, 1200)).toBe('$1,200');
    expect(formatKpiValue({ kind: 'currency', currency: 'EUR' }, 1200)).toBe('€1,200');
  });

  it('writes percentages from points, and adds a unit', () => {
    expect(formatKpiValue({ kind: 'percent' }, 34)).toBe('34%');
    expect(formatKpiValue({ kind: 'number', unit: 'wallets' }, 9840)).toBe('9,840 wallets');
  });
});

describe('buildKpi', () => {
  it('shows a dash for a KPI with no readings yet', () => {
    expect(buildKpi(definition(), [])).toEqual({ id: 'swap-volume', label: 'Swap volume', value: '—' });
  });

  it('shows the newest reading, whatever order they arrive in', () => {
    const kpi = buildKpi(definition(), [reading(30, 100), reading(0, 120), reading(60, 90)]);

    expect(kpi.value).toBe('120');
  });

  it('compares with the reading before it and says how long ago that was', () => {
    const kpi = buildKpi(definition({ format: { kind: 'currency', compact: true } }), [
      reading(0, 1_820_000_000),
      reading(30, 2_000_000_000),
    ]);

    expect(kpi).toEqual({
      id: 'swap-volume',
      label: 'Swap volume',
      value: '$1.82B',
      delta: { text: '▼ 9%', tone: 'negative' },
      comparison: 'vs last month',
    });
  });

  it('names the date when the gap is not a familiar period', () => {
    const kpi = buildKpi(definition(), [reading(0, 110), reading(17, 100)]);

    expect(kpi.comparison).toBe('vs 16 Oct');
  });

  it('prefers a comparison figure the source supplied', () => {
    const kpi = buildKpi(definition(), [reading(0, 150, { previous: 100 }), reading(30, 140)]);

    expect(kpi.delta).toEqual({ text: '▲ 50%', tone: 'positive' });
    expect(kpi.comparison).toBe('vs previous');
  });

  it('lets the KPI decide which way is good', () => {
    const readings = [reading(0, 80), reading(30, 100)];

    expect(buildKpi(definition({ direction: 'up_good' }), readings).delta?.tone).toBe('negative');
    expect(buildKpi(definition({ direction: 'down_good' }), readings).delta?.tone).toBe('positive');
    expect(buildKpi(definition({ direction: 'neutral' }), readings).delta?.tone).toBe('neutral');
  });

  it('moves a percent KPI in points, not percent', () => {
    const kpi = buildKpi(definition({ format: { kind: 'percent' } }), [reading(0, 34), reading(30, 37)]);

    expect(kpi.value).toBe('34%');
    expect(kpi.delta).toEqual({ text: '▼ 3 pts', tone: 'negative' });
  });

  it('says nothing changed, and skips a change from zero', () => {
    expect(buildKpi(definition(), [reading(0, 5), reading(30, 5)]).delta).toEqual({ text: 'No change', tone: 'neutral' });
    expect(buildKpi(definition(), [reading(0, 5), reading(30, 0)]).delta).toBeUndefined();
  });

  it('compares with the same time last year, within a month of it', () => {
    const year = definition({ comparison: { kind: 'year_ago' } });

    expect(buildKpi(year, [reading(0, 150), reading(30, 120), reading(370, 100)])).toMatchObject({
      delta: { text: '▲ 50%', tone: 'positive' },
      comparison: 'vs last year',
    });
    expect(buildKpi(year, [reading(0, 150), reading(30, 120)]).delta).toBeUndefined();
  });

  it('compares with a target', () => {
    const kpi = buildKpi(definition({ comparison: { kind: 'target', value: 200, label: 'vs goal' } }), [reading(0, 150)]);

    expect(kpi.delta).toEqual({ text: '▼ 25%', tone: 'negative' });
    expect(kpi.comparison).toBe('vs goal');
  });

  it('can turn the comparison off, or relabel it', () => {
    const readings = [reading(0, 120), reading(30, 100)];

    expect(buildKpi(definition({ comparison: { kind: 'none' } }), readings).delta).toBeUndefined();
    expect(buildKpi(definition({ comparison: { kind: 'previous', label: 'vs September' } }), readings).comparison).toBe(
      'vs September',
    );
  });

  it('shows the words of a text KPI, with no change', () => {
    const kpi = buildKpi(definition({ format: { kind: 'text' } }), [
      reading(0, null, { textValue: 'Strong' }),
      reading(30, null, { textValue: 'Early' }),
    ]);

    expect(kpi).toEqual({ id: 'swap-volume', label: 'Swap volume', value: 'Strong' });
  });
});

describe('KPI configuration schemas', () => {
  it('fills in the defaults of a format', () => {
    expect(KpiFormat.parse({})).toEqual({ kind: 'number' });
    expect(() => KpiFormat.parse({ kind: 'emoji' })).toThrow();
    expect(() => KpiFormat.parse({ kind: 'currency', currency: 'DOLLARS' })).toThrow();
  });

  it('knows the comparisons, and needs a value for a target', () => {
    expect(KpiComparison.parse({ kind: 'previous' })).toEqual({ kind: 'previous' });
    expect(() => KpiComparison.parse({ kind: 'target' })).toThrow();
    expect(() => KpiComparison.parse({ kind: 'median' })).toThrow();
  });

  it('knows the sources, and needs real ids for a notebook', () => {
    const ids = { documentId: '5f0c6f2e-4a0b-4d0e-9a53-0d6a1f1f7c10', blockId: '6a1d7f3f-5b1c-4e1f-8b64-1e7b2a2a8d21' };

    expect(KpiSource.parse({ kind: 'notebook', ...ids })).toEqual({ kind: 'notebook', ...ids });
    expect(KpiSource.parse({ kind: 'manual' })).toEqual({ kind: 'manual' });
    expect(() => KpiSource.parse({ kind: 'notebook', documentId: 'x', blockId: 'y' })).toThrow();
  });
});
