import { analysisMockData } from "@/_mockdata/analysis";
import { overviewMockData } from "@/_mockdata/overview";
import { sessionMockData } from "@/_mockdata/session";
import { findBlock } from "@/features/overview/types";
import type { OrganisationTypeId } from "@/features/setup/options/organisation-types";
import type { WelcomeContent } from "@/features/welcome/types";

const exchangeContent: WelcomeContent = {
  firstBriefingCount: 6,
  briefingHighlight:
    "Including Argentina's off-ramps, worth about $43K a month",
  readyReports: 4,
  trackingSummary:
    "Tracking Acme Wallet and Acme Chain, 4 competitors and 3 regions.",
};

function contentFromOverview(kind: OrganisationTypeId): WelcomeContent {
  const overview = overviewMockData[kind];
  const briefing = findBlock(overview.blocks, "briefing");
  const topOpportunity = findBlock(overview.blocks, "opportunities")?.items[0];

  return {
    firstBriefingCount: briefing?.entries.length ?? 0,
    briefingHighlight: topOpportunity
      ? `Including ${topOpportunity.title}: ${topOpportunity.value} ${topOpportunity.valueLabel}`
      : "Fresh findings for your first look",
    readyReports: analysisMockData[kind].highlights.length,
    trackingSummary: `Tracking the contracts, competitors and regions you added for ${sessionMockData[kind].client.name}.`,
  };
}

export const welcomeMockData: Record<OrganisationTypeId, WelcomeContent> = {
  exchange: exchangeContent,
  protocol: contentFromOverview("protocol"),
  chain: contentFromOverview("chain"),
  vc: contentFromOverview("vc"),
  accelerator: contentFromOverview("accelerator"),
  other: contentFromOverview("other"),
};
