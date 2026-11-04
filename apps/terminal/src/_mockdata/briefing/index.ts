import { overviewMockData } from "@/_mockdata/overview";
import type { OrganisationTypeId } from "@/features/setup/options/organisation-types";
import type { BriefingFeed } from "@/features/briefing/types";

import { exchangeBriefing } from "./exchange";
import { briefingFromOverview } from "./from-overview";

export const briefingMockData: Record<OrganisationTypeId, BriefingFeed> = {
  exchange: exchangeBriefing,
  protocol: briefingFromOverview(overviewMockData.protocol),
  chain: briefingFromOverview(overviewMockData.chain),
  vc: briefingFromOverview(overviewMockData.vc),
  accelerator: briefingFromOverview(overviewMockData.accelerator),
  other: briefingFromOverview(overviewMockData.other),
};
