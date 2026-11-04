import type { OrganisationTypeId } from "@/features/setup/options/organisation-types";

import type { OverviewData } from "../types";

import { acceleratorOverview } from "./accelerator";
import { chainOverview } from "./chain";
import { exchangeOverview } from "./exchange";
import { nftOverview } from "./nft";
import { protocolOverview } from "./protocol";
import { vcOverview } from "./vc";

export const overviewFixtures: Record<OrganisationTypeId, OverviewData> = {
  exchange: exchangeOverview,
  nft: nftOverview,
  protocol: protocolOverview,
  chain: chainOverview,
  vc: vcOverview,
  accelerator: acceleratorOverview,
};
