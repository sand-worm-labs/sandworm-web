import { ApiUnauthenticatedError, gql } from "@/lib/api";

export type CurrentUser = {
  id: string;
  username: string | null;
  email: string | null;
  fullName: string | null;
};

const CURRENT_USER = `
  query TerminalCurrentUser {
    currentUser { user { id username email fullName } }
  }
`;

// The signed-in visitor, or null when there is no session.
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const data = await gql<{ currentUser: { user: CurrentUser } }>(
      CURRENT_USER
    );
    return data.currentUser.user;
  } catch (err) {
    if (err instanceof ApiUnauthenticatedError) return null;
    throw err;
  }
}
