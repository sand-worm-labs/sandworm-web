import { getPreviewClientKind } from "@/features/preview/cookies";
import { getSession } from "@/features/session/source";
import { welcomeMockData } from "@/_mockdata/welcome";

import { buildWelcome } from "./build-welcome";
import type { WelcomeData } from "./types";

export async function getWelcome(): Promise<WelcomeData | undefined> {
  const [clientKind, session] = await Promise.all([
    getPreviewClientKind(),
    getSession(),
  ]);

  return buildWelcome(welcomeMockData[clientKind], session);
}
