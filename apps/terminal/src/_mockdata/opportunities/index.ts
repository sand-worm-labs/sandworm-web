import { overviewMockData } from "@/_mockdata/overview";
import type { OrganisationTypeId } from "@/features/setup/options/organisation-types";
import type { OpportunitiesFeed } from "@/features/opportunities/types";

import { exchangeOpportunities } from "./exchange";
import { opportunitiesFromOverview } from "./from-overview";

export const opportunityMockData: Record<
  OrganisationTypeId,
  OpportunitiesFeed
> = {
  exchange: exchangeOpportunities,
  nft: opportunitiesFromOverview(overviewMockData.nft),
  protocol: opportunitiesFromOverview(overviewMockData.protocol),
  chain: opportunitiesFromOverview(overviewMockData.chain),
  vc: opportunitiesFromOverview(overviewMockData.vc),
  accelerator: opportunitiesFromOverview(overviewMockData.accelerator),
};
