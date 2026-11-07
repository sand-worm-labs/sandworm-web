import type { MockClientId } from "@/_mockdata/clients";
import { overviewMockData } from "@/_mockdata/overview";
import type { SignalsFeed } from "@/types";

import { exchangeSignals } from "./exchange";
import { signalsFromOverview } from "./from-overview";

export const signalMockData: Record<MockClientId, SignalsFeed> = {
  exchange: exchangeSignals,
  protocol: signalsFromOverview(overviewMockData.protocol),
  chain: signalsFromOverview(overviewMockData.chain),
  vc: signalsFromOverview(overviewMockData.vc),
  accelerator: signalsFromOverview(overviewMockData.accelerator),
  other: signalsFromOverview(overviewMockData.other),
  paycrest: signalsFromOverview(overviewMockData.paycrest),
};
