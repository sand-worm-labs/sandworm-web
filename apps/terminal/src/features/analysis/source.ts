import { getPreviewClientKind } from "@/features/preview/cookies";

import { analysisFixtures } from "./fixtures";
import type { AnalysisCatalog } from "./types";

export async function getAnalysis(): Promise<AnalysisCatalog> {
  return analysisFixtures[await getPreviewClientKind()];
}
