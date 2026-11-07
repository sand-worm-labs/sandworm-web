import type { ClientKind, RequestsData } from "@/types";
import { sessionMockData } from "@/_mockdata/session";

import { exchangeRequests } from "./exchange";
import { genericRequests } from "./generic";

export const requestMockData: Record<ClientKind, RequestsData> = {
  exchange: exchangeRequests,
  protocol: genericRequests(sessionMockData.protocol.user.name),
  chain: genericRequests(sessionMockData.chain.user.name),
  vc: genericRequests(sessionMockData.vc.user.name),
  accelerator: genericRequests(sessionMockData.accelerator.user.name),
  other: genericRequests(sessionMockData.other.user.name),
  paycrest: genericRequests(sessionMockData.paycrest.user.name),
};
