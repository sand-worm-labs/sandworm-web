import type { HeaderUser } from "@sandworm/ui/kit/app-header";

import { env } from "@/config/env";
import { getPreviewAccess } from "@/features/preview/cookies";
import { gql } from "@/lib/api";

import { getCurrentUser } from "./user";

export type HeaderAccount = {
  user: HeaderUser | null;
  workspaceName: string | null;
};

const CURRENT_WORKSPACE = `query CurrentWorkspace { getUserWorkspaceInfo { name } }`;

// The Sandworm workspace the web app calls current, the one "Open Workspace" opens.
async function getWorkspaceName(): Promise<string | null> {
  if (await getPreviewAccess()) return null;

  try {
    const data = await gql<{ getUserWorkspaceInfo: { name: string } }>(
      CURRENT_WORKSPACE
    );
    return data.getUserWorkspaceInfo.name;
  } catch (error) {
    if (env.devBypassAuth) return null;
    throw error;
  }
}

// Who the header shows: the signed-in user and the workspace they are in.
export async function getHeaderAccount(): Promise<HeaderAccount> {
  const user = await getCurrentUser();
  if (!user) return { user: null, workspaceName: null };

  const name = user.firstName || user.username || "Account";
  return {
    user: {
      name,
      fullName: user.fullName ?? `${name} ${user.lastName ?? ""}`.trim(),
      email: user.email,
      avatarUrl: user.avater,
    },
    workspaceName: await getWorkspaceName(),
  };
}
