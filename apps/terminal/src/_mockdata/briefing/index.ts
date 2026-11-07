import type { BriefingFeed, ClientKind } from "@/types";
import { overviewMockData } from "@/_mockdata/overview";

import { exchangeBriefing } from "./exchange";
import { paycrestBriefing } from "./paycrest";
import { briefingFromOverview } from "./from-overview";

export const briefingMockData: Record<ClientKind, BriefingFeed> = {
  exchange: exchangeBriefing,
  protocol: briefingFromOverview(overviewMockData.protocol),
  chain: briefingFromOverview(overviewMockData.chain),
  vc: briefingFromOverview(overviewMockData.vc),
  accelerator: briefingFromOverview(overviewMockData.accelerator),
  other: briefingFromOverview(overviewMockData.other),
  paycrest: paycrestBriefing,
};
