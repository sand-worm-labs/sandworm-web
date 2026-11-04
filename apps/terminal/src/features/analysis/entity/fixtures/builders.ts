import type { Tone } from "@sandworm/ui/kit/tone";

import { toId } from "@/lib/slug";

import { barShare } from "../chart-math";
import type {
  BarRow,
  BarTone,
  ColumnBar,
  EntityKpi,
  SignalLink,
  ReportLink,
  TableCell,
  TableRow,
} from "../types";

export function kpi(
  label: string,
  value: string,
  delta?: { text: string; tone: Tone },
  comparison?: string
): EntityKpi {
  return { id: toId(label), label, value, delta, comparison };
}

export function changeTone(text: string): Tone {
  if (text.startsWith("▲")) return "positive";
  if (text.startsWith("▼")) return "negative";
  return "neutral";
}

export const text = (value: string, isStrong = false): TableCell => ({
  _tag: "text",
  text: value,
  isStrong,
});

export const badge = (value: string, tone: Tone | "brand"): TableCell => ({
  _tag: "badge",
  text: value,
  tone,
});

export const change = (value: string): TableCell =>
  badge(value, changeTone(value));

export const entity = (name: string): TableCell => ({ _tag: "entity", name });

export function tableRow(cells: TableCell[], idSource: string): TableRow {
  return { id: toId(idSource), cells };
}

export function barRow(
  label: string,
  share: number,
  valueLabel: string,
  tone: BarTone,
  isHighlighted = false
): BarRow {
  return { id: toId(label), label, share, valueLabel, tone, isHighlighted };
}

export function scaledBarRow(
  label: string,
  value: number,
  max: number,
  valueLabel: string,
  tone: BarTone,
  isHighlighted = false
): BarRow {
  return barRow(label, barShare(value, max), valueLabel, tone, isHighlighted);
}

export function columnBar(
  label: string,
  value: number,
  valueLabel: string
): ColumnBar {
  return { id: toId(label), label, value, valueLabel };
}

export function reportLink(init: Omit<ReportLink, "id">): ReportLink {
  return { ...init, id: toId(init.title) };
}

export function signalLink(init: Omit<SignalLink, "id">): SignalLink {
  return { ...init, id: toId(init.title) };
}
