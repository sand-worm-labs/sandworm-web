import { getPreviewClientKind, getPreviewAccess } from "@/lib/preview/cookies";
import { getSession } from "@/lib/session/source";
import { env } from "@/config/env";
import { gql } from "@/lib/api";
import { welcomeMockData } from "@/_mockdata/welcome";

import { buildWelcome } from "./build-welcome";
import type { WelcomeData } from "./types";

const NEEDS_WELCOME = `query TerminalNeedsWelcome { terminalSession { needsWelcome } }`;

// A dev preview or the dev bypass has no real member, so it always shows the welcome.
async function needsWelcome(): Promise<boolean> {
  if (env.devBypassAuth || (await getPreviewAccess())) return true;

  const data = await gql<{ terminalSession: { needsWelcome: boolean } }>(
    NEEDS_WELCOME
  );
  return data.terminalSession.needsWelcome;
}

// The welcome shows once, on a member's first visit: nothing here once they have seen it.
export async function getWelcome(): Promise<WelcomeData | undefined> {
  const [clientKind, session, isDue] = await Promise.all([
    getPreviewClientKind(),
    getSession(),
    needsWelcome(),
  ]);

  return isDue ? buildWelcome(welcomeMockData[clientKind], session) : undefined;
}
