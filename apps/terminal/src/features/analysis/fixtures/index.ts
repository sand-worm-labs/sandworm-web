import { overviewFixtures } from "@/features/overview/fixtures";
import type { OrganisationTypeId } from "@/features/setup/options/organisation-types";

import type { AnalysisCatalog } from "../types";

import { exchangeAnalysis } from "./exchange";
import { analysisFromOverview } from "./from-overview";

export const analysisFixtures: Record<OrganisationTypeId, AnalysisCatalog> = {
  exchange: exchangeAnalysis,
  nft: analysisFromOverview(overviewFixtures.nft),
  protocol: analysisFromOverview(overviewFixtures.protocol),
  chain: analysisFromOverview(overviewFixtures.chain),
  vc: analysisFromOverview(overviewFixtures.vc),
  accelerator: analysisFromOverview(overviewFixtures.accelerator),
};
