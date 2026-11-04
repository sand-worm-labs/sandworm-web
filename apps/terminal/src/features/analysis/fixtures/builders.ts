import { toId } from "@/lib/slug";

import type { AnalysisHighlight, AnalysisRow } from "../types";

export function analysisRow(
  init: Omit<AnalysisRow, "id" | "slug" | "hasPage">
): AnalysisRow {
  const id = toId(init.name);
  return { ...init, id, slug: id, hasPage: false };
}

export function highlight(
  init: Omit<AnalysisHighlight, "id">
): AnalysisHighlight {
  return { ...init, id: toId(init.title) };
}
