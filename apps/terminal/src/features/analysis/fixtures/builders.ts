import { toId } from "@/lib/slug";

import type { AnalysisHighlight, AnalysisRow } from "../types";

export function analysisRow(init: Omit<AnalysisRow, "id">): AnalysisRow {
  return { ...init, id: toId(init.name) };
}

export function highlight(
  init: Omit<AnalysisHighlight, "id">
): AnalysisHighlight {
  return { ...init, id: toId(init.title) };
}
