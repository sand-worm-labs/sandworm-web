import type { AnalysisCatalog, ClientKind } from "@/types";
import { overviewMockData } from "@/_mockdata/overview";

import { exchangeAnalysis } from "./exchange";
import { paycrestAnalysis } from "./paycrest";
import { analysisFromOverview } from "./from-overview";

export const analysisMockData: Record<ClientKind, AnalysisCatalog> = {
  exchange: exchangeAnalysis,
  protocol: analysisFromOverview(overviewMockData.protocol),
  chain: analysisFromOverview(overviewMockData.chain),
  vc: analysisFromOverview(overviewMockData.vc),
  accelerator: analysisFromOverview(overviewMockData.accelerator),
  other: analysisFromOverview(overviewMockData.other),
  paycrest: paycrestAnalysis,
};
