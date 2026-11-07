import type { TerminalSession } from "@sandworm/types/terminal";

import { getPreviewClientKind } from "@/lib/preview/cookies";
import { gql } from "@/lib/api";
import { liveOr } from "@/lib/live";
import { sessionMockData } from "@/_mockdata/session";
import type { Session } from "@/types";

const TERMINAL_SESSION = `
  query TerminalSession {
    terminalSession { user { name } client { name type access } firstBriefingDays }
  }
`;

export async function getSession(): Promise<Session> {
  return liveOr(
    async () => {
      const { terminalSession: live } = await gql<{
        terminalSession: TerminalSession;
      }>(TERMINAL_SESSION);
      if (!live.client) return null;
      return {
        user: live.user,
        client: {
          name: live.client.name,
          firstBriefingDays: live.firstBriefingDays,
        },
      };
    },
    async () => sessionMockData[await getPreviewClientKind()]
  );
}
