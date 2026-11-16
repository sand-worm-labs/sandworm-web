import { env } from "@/config/env";
import { getCurrentUser } from "@/lib/auth/user";
import { getPreviewAccess } from "@/lib/preview/cookies";
import { gql } from "@/lib/api";
import type { Access } from "@/types";

import { resolveAccess } from "./resolve-access";

const TERMINAL_MEMBERSHIP = `query TerminalMembership { terminalSession { client { name } } }`;

export async function getAccess(): Promise<Access> {
  const preview = await getPreviewAccess();
  if (preview === "allowed") return { _tag: "allowed" };

  const user = await getCurrentUser();
  if (preview === "noClient") {
    return { _tag: "noClient", email: user?.email ?? null };
  }
  if (env.devBypassAuth) return { _tag: "allowed" };
  if (!user) return resolveAccess(null, false);

  const data = await gql<{ terminalSession: { client: unknown } }>(
    TERMINAL_MEMBERSHIP
  );
  return resolveAccess(user, data.terminalSession.client !== null);
}
