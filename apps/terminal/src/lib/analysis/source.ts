import { getPreviewClientKind } from "@/lib/preview/cookies";
import { analysisMockData } from "@/_mockdata/analysis/index";
import type { AnalysisCatalog } from "@/types";

export async function getAnalysis(): Promise<AnalysisCatalog> {
  return analysisMockData[await getPreviewClientKind()];
}
