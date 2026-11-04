import { sessionMockData } from "@/_mockdata/session";
import type { OrganisationTypeId } from "@/features/setup/options/organisation-types";
import type { RequestsData } from "@/features/requests/types";

import { exchangeRequests } from "./exchange";
import { genericRequests } from "./generic";

export const requestMockData: Record<OrganisationTypeId, RequestsData> = {
  exchange: exchangeRequests,
  nft: genericRequests(sessionMockData.nft.user.name),
  protocol: genericRequests(sessionMockData.protocol.user.name),
  chain: genericRequests(sessionMockData.chain.user.name),
  vc: genericRequests(sessionMockData.vc.user.name),
  accelerator: genericRequests(sessionMockData.accelerator.user.name),
};
