import { env } from "@/config/env";
import { getPreviewAccess } from "@/features/preview/cookies";
import { ApiUnauthenticatedError, gql } from "@/lib/api";

export type CurrentUser = {
  id: string;
  username: string | null;
  email: string | null;
  fullName: string | null;
  firstName: string | null;
  lastName: string | null;
  avater: string | null;
};

const CURRENT_USER = `
  query TerminalCurrentUser {
    currentUser { user { id username email fullName firstName lastName avater } }
  }
`;

const PREVIEW_USER: CurrentUser = {
  id: "preview",
  username: "preview",
  email: "preview@sandworm.dev",
  fullName: "Preview User",
  firstName: "Preview",
  lastName: "User",
  avater: null,
};

// The signed-in visitor, or null when there is no session. A preview session
// (/dev/preview) gets a fixed user, so the terminal runs without the API; so
// does the dev bypass when nobody is signed in or the API is down.
export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (await getPreviewAccess()) return PREVIEW_USER;

  try {
    const data = await gql<{ currentUser: { user: CurrentUser } }>(
      CURRENT_USER
    );
    return data.currentUser.user;
  } catch (err) {
    if (env.devBypassAuth) return PREVIEW_USER;
    if (err instanceof ApiUnauthenticatedError) return null;
    throw err;
  }
}
