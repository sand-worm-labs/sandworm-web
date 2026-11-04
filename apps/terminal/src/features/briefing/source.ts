import type { TerminalBriefing } from "@sandworm/types/terminal";

import {
  getPreviewBriefing,
  getPreviewClientKind,
} from "@/features/preview/cookies";
import { gql } from "@/lib/api";
import { liveOr } from "@/lib/live";
import { briefingMockData } from "@/_mockdata/briefing";

import { briefingFromApi } from "./from-api";
import type { BriefingFeed } from "./types";

const TERMINAL_BRIEFING = `
  query TerminalBriefing {
    terminalBriefing {
      lastSeenAt archivedCount
      items { id kind title summary subject detail publishedAt isRead sourcePath }
    }
  }
`;

export async function getBriefing(): Promise<BriefingFeed> {
  return liveOr(
    async () => {
      const data = await gql<{ terminalBriefing: TerminalBriefing }>(
        TERMINAL_BRIEFING
      );
      return briefingFromApi(data.terminalBriefing);
    },
    async () => {
      const [clientKind, mode] = await Promise.all([
        getPreviewClientKind(),
        getPreviewBriefing(),
      ]);
      const feed = briefingMockData[clientKind];
      return mode === "empty" ? { ...feed, items: [] } : feed;
    }
  );
}
