import type { ClientKind, SectionCounts } from "@/types";

export const sectionCountsMockData: Record<ClientKind, SectionCounts> = {
  exchange: {
    briefing: "6",
    analysis: "24",
    signals: "6",
    requests: "2",
  },
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
  other: { briefing: "6", analysis: "12", signals: "4", requests: "1" },
  paycrest: {
    briefing: "12",
    analysis: "15",
    signals: "10",
    requests: "1",
  },
};
