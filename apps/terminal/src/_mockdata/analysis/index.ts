import type { MockClientId } from "@/_mockdata/clients";
import { overviewMockData } from "@/_mockdata/overview";
import type { AnalysisCatalog } from "@/features/analysis/types";

import { exchangeAnalysis } from "./exchange";
import { paycrestAnalysis } from "./paycrest";
import { analysisFromOverview } from "./from-overview";

export const analysisMockData: Record<MockClientId, AnalysisCatalog> = {
  exchange: exchangeAnalysis,
  protocol: analysisFromOverview(overviewMockData.protocol),
  chain: analysisFromOverview(overviewMockData.chain),
  vc: analysisFromOverview(overviewMockData.vc),
  accelerator: analysisFromOverview(overviewMockData.accelerator),
  other: analysisFromOverview(overviewMockData.other),
  paycrest: paycrestAnalysis,
};
