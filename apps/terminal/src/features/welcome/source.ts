import { getPreviewClientKind } from "@/features/preview/cookies";
import { getSession } from "@/features/session/source";

import { buildWelcome } from "./build-welcome";
import { welcomeContentFixtures } from "./fixtures";
import type { WelcomeData } from "./types";

export async function getWelcome(): Promise<WelcomeData | undefined> {
  const [clientKind, session] = await Promise.all([
    getPreviewClientKind(),
    getSession(),
  ]);

  return buildWelcome(welcomeContentFixtures[clientKind], session);
}
