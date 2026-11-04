import { overviewMockData } from "@/_mockdata/overview";
import type { OrganisationTypeId } from "@/features/setup/options/organisation-types";
import type { AnalysisCatalog } from "@/features/analysis/types";

import { exchangeAnalysis } from "./exchange";
import { analysisFromOverview } from "./from-overview";

export const analysisMockData: Record<OrganisationTypeId, AnalysisCatalog> = {
  exchange: exchangeAnalysis,
  protocol: analysisFromOverview(overviewMockData.protocol),
  chain: analysisFromOverview(overviewMockData.chain),
  vc: analysisFromOverview(overviewMockData.vc),
  accelerator: analysisFromOverview(overviewMockData.accelerator),
  other: analysisFromOverview(overviewMockData.other),
};
