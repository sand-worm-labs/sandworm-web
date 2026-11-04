import { overviewFixtures } from "@/features/overview/fixtures";
import type { OrganisationTypeId } from "@/features/setup/options/organisation-types";

import type { OpportunitiesFeed } from "../types";

import { exchangeOpportunities } from "./exchange";
import { opportunitiesFromOverview } from "./from-overview";

export const opportunityFixtures: Record<
  OrganisationTypeId,
  OpportunitiesFeed
> = {
  exchange: exchangeOpportunities,
  nft: opportunitiesFromOverview(overviewFixtures.nft),
  protocol: opportunitiesFromOverview(overviewFixtures.protocol),
  chain: opportunitiesFromOverview(overviewFixtures.chain),
  vc: opportunitiesFromOverview(overviewFixtures.vc),
  accelerator: opportunitiesFromOverview(overviewFixtures.accelerator),
};
