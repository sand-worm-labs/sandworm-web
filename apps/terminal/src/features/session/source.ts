import { getPreviewClientKind } from "@/features/preview/cookies";
import { sessionMockData } from "@/_mockdata/session";

import type { Session } from "./types";

export async function getSession(): Promise<Session> {
  return sessionMockData[await getPreviewClientKind()];
}
