import type { MockClientId } from "@/_mockdata/clients";
import { sessionMockData } from "@/_mockdata/session";
import type { RequestsData } from "@/types";

import { exchangeRequests } from "./exchange";
import { genericRequests } from "./generic";

export const requestMockData: Record<MockClientId, RequestsData> = {
  exchange: exchangeRequests,
  protocol: genericRequests(sessionMockData.protocol.user.name),
  chain: genericRequests(sessionMockData.chain.user.name),
  vc: genericRequests(sessionMockData.vc.user.name),
  accelerator: genericRequests(sessionMockData.accelerator.user.name),
  other: genericRequests(sessionMockData.other.user.name),
  paycrest: genericRequests(sessionMockData.paycrest.user.name),
};
