import { OrganisationTypeId } from "@sandworm/types/terminal";

import type { ClientKind, WelcomeContent } from "@/types";
import { analysisMockData } from "@/_mockdata/analysis";
import { overviewMockData } from "@/_mockdata/overview";
import { sessionMockData } from "@/_mockdata/session";
import { findBlock } from "@/lib/overview/blocks";

const exchangeContent: WelcomeContent = {
  firstBriefingCount: 6,
  briefingHighlight:
    "Including Argentina's off-ramps, worth about $43K a month",
  readyReports: 4,
  trackingSummary:
    "Tracking Acme Wallet and Acme Chain, 4 competitors and 3 regions.",
};

function contentFromOverview(kind: ClientKind): WelcomeContent {
  const overview = overviewMockData[kind];
  const briefing = findBlock(overview.blocks, "briefing");
  const topSignal = findBlock(overview.blocks, "signals")?.items[0];

  return {
    firstBriefingCount: briefing?.entries.length ?? 0,
    briefingHighlight: topSignal
      ? `Including ${topSignal.title}: ${topSignal.size} ${topSignal.sizeLabel}`
      : "Fresh findings for your first look",
    readyReports: analysisMockData[kind].highlights.length,
    trackingSummary: `Tracking the contracts, competitors and regions you added for ${sessionMockData[kind].client.name}.`,
  };
}

export const welcomeMockData: Record<ClientKind, WelcomeContent> = {
  exchange: exchangeContent,
  protocol: contentFromOverview(OrganisationTypeId.PROTOCOL),
  chain: contentFromOverview(OrganisationTypeId.CHAIN),
  vc: contentFromOverview(OrganisationTypeId.VC),
  accelerator: contentFromOverview(OrganisationTypeId.ACCELERATOR),
  other: contentFromOverview(OrganisationTypeId.OTHER),
  paycrest: {
    firstBriefingCount: 6,
    briefingHighlight:
      "Including Lemon Cash's $16M a week in stablecoin payouts",
    readyReports: 5,
    trackingSummary:
      "Tracking Paycrest's gateways on 8 chains, plus Lemon Cash, Nexo, El Dorado, P2P.me, Resolva and PAJ Cash.",
  },
};
