import { toId } from "@/lib/slug";
import type { AnalysisHighlight, AnalysisRow } from "@/types";

export function analysisRow(
  init: Omit<AnalysisRow, "id" | "hasPage" | "icon">
): AnalysisRow {
  return { ...init, id: toId(init.name), icon: null, hasPage: false };
}

export function highlight(
  init: Omit<AnalysisHighlight, "id" | "icon">
): AnalysisHighlight {
  return { ...init, id: toId(init.title), icon: null };
}
