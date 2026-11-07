import type { MockClientId } from "@/_mockdata/clients";
import { overviewMockData } from "@/_mockdata/overview";
import type { OpportunitiesFeed } from "@/features/opportunities/types";

import { exchangeOpportunities } from "./exchange";
import { opportunitiesFromOverview } from "./from-overview";

export const opportunityMockData: Record<MockClientId, OpportunitiesFeed> = {
  exchange: exchangeOpportunities,
  protocol: opportunitiesFromOverview(overviewMockData.protocol),
  chain: opportunitiesFromOverview(overviewMockData.chain),
  vc: opportunitiesFromOverview(overviewMockData.vc),
  accelerator: opportunitiesFromOverview(overviewMockData.accelerator),
  other: opportunitiesFromOverview(overviewMockData.other),
  paycrest: opportunitiesFromOverview(overviewMockData.paycrest),
};
