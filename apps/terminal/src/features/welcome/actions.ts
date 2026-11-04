"use server";

import { env } from "@/config/env";
import { getPreviewAccess } from "@/features/preview/cookies";
import { gql } from "@/lib/api";

const MARK_WELCOMED = `mutation MarkTerminalWelcomed { markTerminalWelcomed }`;

// Remembers that this member has seen the welcome. A preview has no member to remember.
export async function dismissWelcome(): Promise<void> {
  if (env.devBypassAuth || (await getPreviewAccess())) return;

  await gql(MARK_WELCOMED);
}
