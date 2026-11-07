import type { MockClientId } from "@/_mockdata/clients";
import type { SectionCounts } from "@/features/sections/types";

export const sectionCountsMockData: Record<MockClientId, SectionCounts> = {
  exchange: {
    briefing: "6",
    analysis: "24",
    opportunities: "6",
    requests: "2",
  },
  protocol: {
    briefing: "6",
    analysis: "19",
    opportunities: "4",
    requests: "1",
  },
  chain: { briefing: "6", analysis: "21", opportunities: "5", requests: "2" },
  vc: { briefing: "6", analysis: "32", opportunities: "7", requests: "3" },
  accelerator: {
    briefing: "6",
    analysis: "14",
    opportunities: "4",
    requests: "1",
  },
  other: { briefing: "6", analysis: "12", opportunities: "4", requests: "1" },
  paycrest: {
    briefing: "12",
    analysis: "15",
    opportunities: "10",
    requests: "1",
  },
};
