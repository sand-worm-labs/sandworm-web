import type { MockClientId } from "@/_mockdata/clients";
import type { OverviewData } from "@/features/overview/types";

import { acceleratorOverview } from "./accelerator";
import { chainOverview } from "./chain";
import { exchangeOverview } from "./exchange";
import { otherOverview } from "./other";
import { paycrestOverview } from "./paycrest";
import { protocolOverview } from "./protocol";
import { vcOverview } from "./vc";

export const overviewMockData: Record<MockClientId, OverviewData> = {
  exchange: exchangeOverview,
  protocol: protocolOverview,
  chain: chainOverview,
  vc: vcOverview,
  accelerator: acceleratorOverview,
  other: otherOverview,
  paycrest: paycrestOverview,
};
