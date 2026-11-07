import type { TerminalCounts } from "@sandworm/types/terminal";

import { getPreviewClientKind } from "@/lib/preview/cookies";
import { gql } from "@/lib/api";
import { liveOr } from "@/lib/live";
import { sectionCountsMockData } from "@/_mockdata/sections";
import type { SectionCounts } from "@/types";

const TERMINAL_COUNTS = `
  query TerminalCounts { terminalCounts { briefing analysis signals requests } }
`;

export async function getSectionCounts(): Promise<SectionCounts> {
  return liveOr(
    async () => {
      const { terminalCounts: counts } = await gql<{
        terminalCounts: TerminalCounts;
      }>(TERMINAL_COUNTS);
      return {
        briefing: String(counts.briefing),
        analysis: String(counts.analysis),
        signals: String(counts.signals),
        requests: String(counts.requests),
      };
    },
    async () => sectionCountsMockData[await getPreviewClientKind()]
  );
}
