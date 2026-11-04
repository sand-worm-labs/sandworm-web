import type { OrganisationTypeId } from "@/features/setup/options/organisation-types";
import type { OverviewData } from "@/features/overview/types";

import { acceleratorOverview } from "./accelerator";
import { chainOverview } from "./chain";
import { exchangeOverview } from "./exchange";
import { otherOverview } from "./other";
import { protocolOverview } from "./protocol";
import { vcOverview } from "./vc";

export const overviewMockData: Record<OrganisationTypeId, OverviewData> = {
  exchange: exchangeOverview,
  protocol: protocolOverview,
  chain: chainOverview,
  vc: vcOverview,
  accelerator: acceleratorOverview,
  other: otherOverview,
};
