import { toId } from "@/lib/slug";
import type {
  BriefingEntry,
  ConcentrationSegment,
  DestinationRow,
  GapEntry,
  Kpi,
  SignalEntry,
} from "@/features/overview/types";

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

export function segment(
  label: string,
  count: string,
  share: number
): ConcentrationSegment {
  return { id: toId(label), label, count, share };
}

export function destination(
  name: string,
  share: number,
  label: string
): DestinationRow {
  return { id: toId(name), name, share, label };
}
