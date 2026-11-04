import { getPreviewClientKind } from "@/features/preview/cookies";

import { sessionFixtures } from "./fixtures";
import type { Session } from "./types";

export async function getSession(): Promise<Session> {
  return sessionFixtures[await getPreviewClientKind()];
}
