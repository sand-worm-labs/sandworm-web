import type { Tone } from "@sandworm/ui/kit/tone";

import { toId } from "@/lib/slug";
import type {
  Kpi,
  EntityReportLink,
  EntitySignalLink,
  EntityTableCell,
  EntityTableRow,
} from "@/types";

export function kpi(
  label: string,
  value: string,
  delta?: { text: string; tone: Tone },
  comparison?: string
): Kpi {
  return { id: toId(label), label, value, delta, comparison };
}

export function changeTone(text: string): Tone {
  if (text.startsWith("▲")) return "positive";
  if (text.startsWith("▼")) return "negative";
  return "neutral";
}

export const text = (value: string, isStrong = false): EntityTableCell => ({
  _tag: "text",
  text: value,
  isStrong,
});

export const badge = (
  value: string,
  tone: Tone | "brand"
): EntityTableCell => ({
  _tag: "badge",
  text: value,
  tone,
});

export const change = (value: string): EntityTableCell =>
  badge(value, changeTone(value));

export const entity = (name: string): EntityTableCell => ({
  _tag: "entity",
  name,
});

export function tableRow(
  cells: EntityTableCell[],
  idSource: string
): EntityTableRow {
  return { id: toId(idSource), cells };
}

export function reportLink(
  init: Omit<EntityReportLink, "id">
): EntityReportLink {
  return { ...init, id: toId(init.title) };
}

export function signalLink(
  init: Omit<EntitySignalLink, "id">
): EntitySignalLink {
  return { ...init, id: toId(init.title) };
}
