import type { OrganisationTypeId } from "@/features/setup/options/organisation-types";
import type { SectionCounts } from "@/features/sections/types";

export const sectionCountsMockData: Record<OrganisationTypeId, SectionCounts> =
  {
    exchange: {
      briefing: "6",
      analysis: "24",
      signals: "6",
      requests: "2",
    },
    nft: { briefing: "6", analysis: "17", signals: "5", requests: "1" },
    protocol: {
      briefing: "6",
      analysis: "19",
      signals: "4",
      requests: "1",
    },
    chain: { briefing: "6", analysis: "21", signals: "5", requests: "2" },
    vc: { briefing: "6", analysis: "32", signals: "7", requests: "3" },
    accelerator: {
      briefing: "6",
      analysis: "14",
      signals: "4",
      requests: "1",
    },
  };
