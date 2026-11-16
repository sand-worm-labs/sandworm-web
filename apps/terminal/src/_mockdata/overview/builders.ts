import type { Tone } from "@sandworm/ui/kit/tone";

import { toId } from "@/lib/slug";
import type { BriefingEntry, GapEntry, Kpi, SignalEntry } from "@/types";

type KpiInit = {
  label: string;
  value: string;
  delta: string;
  tone: Tone;
  comparison?: string;
};

export function kpi({ delta, tone, comparison, ...init }: KpiInit): Kpi {
  return {
    ...init,
    id: toId(init.label),
    delta: { text: delta, tone },
    comparison: comparison ?? "vs last 30 days",
  };
}

export function briefingEntry(init: Omit<BriefingEntry, "id">): BriefingEntry {
  return { ...init, id: toId(init.title) };
}

export function signalEntry(init: Omit<SignalEntry, "id">): SignalEntry {
  return { ...init, id: toId(init.title) };
}

export function gapEntry(init: Omit<GapEntry, "id">): GapEntry {
  return { ...init, id: toId(init.title) };
}
