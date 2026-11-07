import type { ClientKind, SignalsFeed } from "@/types";
import { overviewMockData } from "@/_mockdata/overview";

import { exchangeSignals } from "./exchange";
import { signalsFromOverview } from "./from-overview";

export const signalMockData: Record<ClientKind, SignalsFeed> = {
  exchange: exchangeSignals,
  protocol: signalsFromOverview(overviewMockData.protocol),
  chain: signalsFromOverview(overviewMockData.chain),
  vc: signalsFromOverview(overviewMockData.vc),
  accelerator: signalsFromOverview(overviewMockData.accelerator),
  other: signalsFromOverview(overviewMockData.other),
  paycrest: signalsFromOverview(overviewMockData.paycrest),
};
