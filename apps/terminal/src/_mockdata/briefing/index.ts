import { overviewFixtures } from "@/features/overview/fixtures";
import type { OrganisationTypeId } from "@/features/setup/options/organisation-types";

import type { BriefingFeed } from "../types";

import { exchangeBriefing } from "./exchange";
import { briefingFromOverview } from "./from-overview";

export const briefingFixtures: Record<OrganisationTypeId, BriefingFeed> = {
  exchange: exchangeBriefing,
  nft: briefingFromOverview(overviewFixtures.nft),
  protocol: briefingFromOverview(overviewFixtures.protocol),
  chain: briefingFromOverview(overviewFixtures.chain),
  vc: briefingFromOverview(overviewFixtures.vc),
  accelerator: briefingFromOverview(overviewFixtures.accelerator),
};
