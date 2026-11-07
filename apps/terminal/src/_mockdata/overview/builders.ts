import { toId } from "@/lib/slug";
import type {
  BriefingEntry,
  GapEntry,
  Kpi,
  SignalEntry,
} from "@/lib/overview/types";

type KpiInit = Omit<Kpi, "id" | "comparison"> & { comparison?: string };

export function kpi(init: KpiInit): Kpi {
  return {
    ...init,
    id: toId(init.label),
    comparison: init.comparison ?? "vs last 30 days",
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
