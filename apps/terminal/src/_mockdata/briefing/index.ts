import type { TerminalBriefing } from "@sandworm/types/terminal";

import type { ClientKind } from "@/types";
import { overviewMockData } from "@/_mockdata/overview";

import { exchangeBriefing } from "./exchange";
import { paycrestBriefing } from "./paycrest";
import { briefingFromOverview } from "./from-overview";

// Built when asked for, so the fixtures' dates are relative to now
export const briefingMockData: Record<ClientKind, () => TerminalBriefing> = {
  exchange: exchangeBriefing,
  protocol: () => briefingFromOverview(overviewMockData.protocol),
  chain: () => briefingFromOverview(overviewMockData.chain),
  vc: () => briefingFromOverview(overviewMockData.vc),
  accelerator: () => briefingFromOverview(overviewMockData.accelerator),
  other: () => briefingFromOverview(overviewMockData.other),
  paycrest: paycrestBriefing,
};
