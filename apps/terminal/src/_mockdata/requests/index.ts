import type { TerminalRequests } from "@sandworm/types/terminal";

import type { ClientKind } from "@/types";
import { sessionMockData } from "@/_mockdata/session";

import { exchangeRequests } from "./exchange";
import { genericRequests } from "./generic";

// Built when asked for, so the fixtures' dates are relative to now
export const requestMockData: Record<ClientKind, () => TerminalRequests> = {
  exchange: exchangeRequests,
  protocol: () => genericRequests(sessionMockData.protocol.user.name),
  chain: () => genericRequests(sessionMockData.chain.user.name),
  vc: () => genericRequests(sessionMockData.vc.user.name),
  accelerator: () => genericRequests(sessionMockData.accelerator.user.name),
  other: () => genericRequests(sessionMockData.other.user.name),
  paycrest: () => genericRequests(sessionMockData.paycrest.user.name),
};
