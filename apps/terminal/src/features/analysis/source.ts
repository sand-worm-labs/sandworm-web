import { getPreviewClientKind } from "@/features/preview/cookies";
import { analysisMockData } from "@/_mockdata/analysis";

import type { AnalysisCatalog } from "./types";

export async function getAnalysis(): Promise<AnalysisCatalog> {
  return analysisMockData[await getPreviewClientKind()];
}
