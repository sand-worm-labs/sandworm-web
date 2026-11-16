import type { ClientKind, OverviewData } from "@/types";

import { acceleratorOverview } from "./accelerator";
import { chainOverview } from "./chain";
import { exchangeOverview } from "./exchange";
import { otherOverview } from "./other";
import { paycrestOverview } from "./paycrest";
import { protocolOverview } from "./protocol";
import { vcOverview } from "./vc";

export const overviewMockData: Record<ClientKind, OverviewData> = {
  exchange: exchangeOverview,
  protocol: protocolOverview,
  chain: chainOverview,
  vc: vcOverview,
  accelerator: acceleratorOverview,
  other: otherOverview,
  paycrest: paycrestOverview,
};
