import { analysisFixtures } from "@/features/analysis/fixtures";
import { overviewFixtures } from "@/features/overview/fixtures";
import { findBlock } from "@/features/overview/types";
import { sessionFixtures } from "@/features/session/fixtures";
import type { OrganisationTypeId } from "@/features/setup/options/organisation-types";

import type { WelcomeContent } from "./types";

const exchangeContent: WelcomeContent = {
  firstBriefingCount: 6,
  briefingHighlight:
    "Including Argentina's off-ramps, worth about $43K a month",
  readyReports: 4,
  trackingSummary:
    "Tracking Robinhood Wallet and Robinhood Chain, 4 competitors and 3 regions.",
};

function contentFromOverview(kind: OrganisationTypeId): WelcomeContent {
  const overview = overviewFixtures[kind];
  const briefing = findBlock(overview.blocks, "briefing");
  const topOpportunity = findBlock(overview.blocks, "opportunities")?.items[0];

  return {
    firstBriefingCount: briefing?.entries.length ?? 0,
    briefingHighlight: topOpportunity
      ? `Including ${topOpportunity.title}: ${topOpportunity.value} ${topOpportunity.valueLabel}`
      : "Fresh findings for your first look",
    readyReports: analysisFixtures[kind].highlights.length,
    trackingSummary: `Tracking the contracts, competitors and regions you added for ${sessionFixtures[kind].client.name}.`,
  };
}

export const welcomeContentFixtures: Record<
  OrganisationTypeId,
  WelcomeContent
> = {
  exchange: exchangeContent,
  nft: contentFromOverview("nft"),
  protocol: contentFromOverview("protocol"),
  chain: contentFromOverview("chain"),
  vc: contentFromOverview("vc"),
  accelerator: contentFromOverview("accelerator"),
};
