import type { MockClientId } from "@/_mockdata/clients";
import { overviewMockData } from "@/_mockdata/overview";
import type { BriefingFeed } from "@/types";

import { exchangeBriefing } from "./exchange";
import { paycrestBriefing } from "./paycrest";
import { briefingFromOverview } from "./from-overview";

export const briefingMockData: Record<MockClientId, BriefingFeed> = {
  exchange: exchangeBriefing,
  protocol: briefingFromOverview(overviewMockData.protocol),
  chain: briefingFromOverview(overviewMockData.chain),
  vc: briefingFromOverview(overviewMockData.vc),
  accelerator: briefingFromOverview(overviewMockData.accelerator),
  other: briefingFromOverview(overviewMockData.other),
  paycrest: paycrestBriefing,
};
