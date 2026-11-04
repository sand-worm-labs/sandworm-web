import { overviewMockData } from "@/_mockdata/overview";
import type { OrganisationTypeId } from "@/features/setup/options/organisation-types";
import type { SignalsFeed } from "@/features/signals/types";

import { exchangeSignals } from "./exchange";
import { signalsFromOverview } from "./from-overview";

export const signalMockData: Record<OrganisationTypeId, SignalsFeed> = {
  exchange: exchangeSignals,
  protocol: signalsFromOverview(overviewMockData.protocol),
  chain: signalsFromOverview(overviewMockData.chain),
  vc: signalsFromOverview(overviewMockData.vc),
  accelerator: signalsFromOverview(overviewMockData.accelerator),
  other: signalsFromOverview(overviewMockData.other),
};
