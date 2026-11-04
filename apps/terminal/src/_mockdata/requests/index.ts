import { sessionFixtures } from "@/features/session/fixtures";
import type { OrganisationTypeId } from "@/features/setup/options/organisation-types";

import type { RequestsData } from "../types";

import { exchangeRequests } from "./exchange";
import { genericRequests } from "./generic";

export const requestFixtures: Record<OrganisationTypeId, RequestsData> = {
  exchange: exchangeRequests,
  nft: genericRequests(sessionFixtures.nft.user.name),
  protocol: genericRequests(sessionFixtures.protocol.user.name),
  chain: genericRequests(sessionFixtures.chain.user.name),
  vc: genericRequests(sessionFixtures.vc.user.name),
  accelerator: genericRequests(sessionFixtures.accelerator.user.name),
};
