import { z } from 'zod';

// Key numbers (KPIs) on the terminal. A KPI is a definition (what it is called,
// how it is shown, where it comes from) plus a history of readings. What the
// terminal draws is worked out from both by `buildKpi`, so tone, delta and the
// comparison text are never stored.

export enum KpiFormatKind {
  NUMBER = 'number',
  CURRENCY = 'currency',
  PERCENT = 'percent',
  TEXT = 'text',
}

// How a reading is written. A percent reading is in percentage points (34 is 34%).
export const KpiFormat = z.object({
  kind: z.enum(KpiFormatKind).default(KpiFormatKind.NUMBER),
  // ISO 4217, for kind "currency"
  currency: z.string().length(3).optional(),
  // A suffix, e.g. "wallets"
  unit: z.string().max(16).optional(),
  decimals: z.number().int().min(0).max(6).optional(),
  // 1.84B instead of 1,840,000,000
  compact: z.boolean().optional(),
});
export type KpiFormat = z.infer<typeof KpiFormat>;

// Which way is good: decides whether a change reads as positive or negative.
export enum KpiDirection {
  UP_GOOD = 'up_good',
  DOWN_GOOD = 'down_good',
  NEUTRAL = 'neutral',
}

// What the latest reading is compared with. `label` replaces the generated
// "vs last month" text.
export const KpiComparison = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('previous'), label: z.string().max(40).optional() }),
  z.object({ kind: z.literal('year_ago'), label: z.string().max(40).optional() }),
  z.object({ kind: z.literal('target'), value: z.number(), label: z.string().max(40).optional() }),
  z.object({ kind: z.literal('none') }),
]);
export type KpiComparison = z.infer<typeof KpiComparison>;

// Where the readings come from. A new kind of source is a new member here,
// not a migration.
export const KpiSource = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('manual') }),
  z.object({ kind: z.literal('notebook'), documentId: z.uuid(), blockId: z.uuid() }),
  z.object({ kind: z.literal('agent'), name: z.string().max(60).optional() }),
]);
export type KpiSource = z.infer<typeof KpiSource>;

// Whatever else a KPI needs that has no field yet
export const KpiSettings = z.record(z.string(), z.unknown());
export type KpiSettings = z.infer<typeof KpiSettings>;

export const DEFAULT_KPI_FORMAT: KpiFormat = { kind: KpiFormatKind.NUMBER };
export const DEFAULT_KPI_COMPARISON: KpiComparison = { kind: 'previous' };
export const DEFAULT_KPI_SOURCE: KpiSource = { kind: 'manual' };

// One reading of a KPI: a number, or words for a KPI that is not a number
export type KpiReading = {
  asOf: string; // ISO date the reading describes
  value: number | null;
  textValue: string | null;
  // The source's own comparison figure, when it supplies one
  previous: number | null;
};

export type KpiTone = 'positive' | 'negative' | 'neutral';

// What the terminal draws for one KPI
export type KpiDisplay = {
  id: string;
  label: string;
  value: string;
  delta?: { text: string; tone: KpiTone };
  comparison?: string;
};

export type KpiDefinition = {
  key: string;
  label: string;
  format: KpiFormat;
  direction: KpiDirection;
  comparison: KpiComparison;
};

const DAY = 24 * 60 * 60 * 1000;
const NO_VALUE = '—';

// en-US on purpose: the same text on the server and in the browser
function number(value: number, { decimals, compact }: Pick<KpiFormat, 'decimals' | 'compact'>, extra: Intl.NumberFormatOptions = {}) {
  return new Intl.NumberFormat('en-US', {
    ...(compact ? { notation: 'compact' as const, maximumFractionDigits: decimals ?? 2 } : { maximumFractionDigits: decimals ?? 2 }),
    ...(decimals !== undefined && !compact ? { minimumFractionDigits: decimals } : {}),
    ...extra,
  }).format(value);
}

// A figure the way this KPI writes it: "$1.84B", "34%", "312,400 wallets"
export function formatKpiValue(format: KpiFormat, value: number): string {
  const unit = format.unit ? ` ${format.unit}` : '';
  switch (format.kind) {
    case KpiFormatKind.CURRENCY:
      return (
        number(value, format, {
          style: 'currency',
          currency: format.currency ?? 'USD',
          // The currency style insists on cents unless told otherwise
          ...(format.compact ? {} : { minimumFractionDigits: format.decimals ?? 0 }),
        }) + unit
      );
    case KpiFormatKind.PERCENT:
      return `${number(value, format)}%${unit}`;
    case KpiFormatKind.TEXT:
    case KpiFormatKind.NUMBER:
    default:
      return number(value, format) + unit;
  }
}

function readingText(format: KpiFormat, reading: KpiReading): string {
  if (format.kind === KpiFormatKind.TEXT) return reading.textValue ?? (reading.value !== null ? String(reading.value) : NO_VALUE);
  if (reading.value === null) return reading.textValue ?? NO_VALUE;
  return formatKpiValue(format, reading.value);
}

const toneOf = (direction: KpiDirection, change: number): KpiTone => {
  if (direction === KpiDirection.NEUTRAL || change === 0) return 'neutral';
  return (change > 0) === (direction === KpiDirection.UP_GOOD) ? 'positive' : 'negative';
};

// "last month", "last week", "yesterday", or the date it was
function sinceLabel(from: string, to: string): string {
  const days = Math.round((new Date(to).getTime() - new Date(from).getTime()) / DAY);
  if (days <= 1) return 'vs yesterday';
  if (days >= 6 && days <= 8) return 'vs last week';
  if (days >= 27 && days <= 32) return 'vs last month';
  if (days >= 88 && days <= 94) return 'vs last quarter';
  if (days >= 360 && days <= 370) return 'vs last year';
  return `vs ${new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(from))}`;
}

type Base = { value: number; label: string };

// The reading the latest one is compared with, and how to say so
function baseOf(comparison: KpiComparison, latest: KpiReading, older: readonly KpiReading[]): Base | null {
  switch (comparison.kind) {
    case 'none':
      return null;
    case 'target':
      return { value: comparison.value, label: comparison.label ?? 'vs target' };
    case 'year_ago': {
      const aim = new Date(latest.asOf).getTime() - 365 * DAY;
      // The closest reading to a year back, within a month of it
      const [closest] = older
        .filter(r => r.value !== null && Math.abs(new Date(r.asOf).getTime() - aim) <= 31 * DAY)
        .sort((a, b) => Math.abs(new Date(a.asOf).getTime() - aim) - Math.abs(new Date(b.asOf).getTime() - aim));
      return closest ? { value: closest.value!, label: comparison.label ?? 'vs last year' } : null;
    }
    case 'previous':
    default: {
      if (latest.previous !== null) return { value: latest.previous, label: comparison.label ?? 'vs previous' };
      const before = older.find(r => r.value !== null);
      return before ? { value: before.value!, label: comparison.label ?? sinceLabel(before.asOf, latest.asOf) } : null;
    }
  }
}

// A change at most one decimal long: "9%", "8.9%", never "9.0%"
const rounded = (value: number) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: value < 10 ? 1 : 0 }).format(value);

// What a change is called: a percent KPI moves in points, anything else in percent
function deltaText(format: KpiFormat, latest: number, base: number): string | null {
  if (latest === base) return 'No change';
  const arrow = latest > base ? '▲' : '▼';
  if (format.kind === KpiFormatKind.PERCENT) return `${arrow} ${rounded(Math.abs(latest - base))} pts`;
  if (base === 0) return null;
  return `${arrow} ${rounded(Math.abs(((latest - base) / base) * 100))}%`;
}

// A KPI as the terminal draws it. `readings` are any order; the newest is the
// value, the rest are what it can be compared with. With no readings it shows
// a dash, so a new KPI is visible before its first number.
export function buildKpi(definition: KpiDefinition, readings: readonly KpiReading[]): KpiDisplay {
  const { key, label, format, direction, comparison } = definition;
  const [latest, ...older] = [...readings].sort((a, b) => b.asOf.localeCompare(a.asOf));
  if (!latest) return { id: key, label, value: NO_VALUE };

  const display: KpiDisplay = { id: key, label, value: readingText(format, latest) };

  const base = latest.value !== null && format.kind !== KpiFormatKind.TEXT ? baseOf(comparison, latest, older) : null;
  if (base && latest.value !== null) {
    const text = deltaText(format, latest.value, base.value);
    if (text) {
      display.delta = { text, tone: toneOf(direction, latest.value - base.value) };
      display.comparison = base.label;
    }
  }
  return display;
}
