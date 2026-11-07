import { getCurrentUser } from "@/lib/auth/user";
import { getPreviewAccess } from "@/lib/preview/cookies";
import { ApiUnauthenticatedError, gql } from "@/lib/api";

export type TeamAccess = "signedOut" | "staff" | "notStaff";

const IS_STAFF = `query TerminalIsStaff { terminalIsStaff }`;

// Whether the visitor is on the Sandworm team. The API checks it again on every
// team call; this only decides what the terminal shows.
export async function getTeamAccess(): Promise<TeamAccess> {
  if (await getPreviewAccess()) return "staff";
  if (!(await getCurrentUser())) return "signedOut";

  try {
    const data = await gql<{ terminalIsStaff: boolean }>(IS_STAFF);
    return data.terminalIsStaff ? "staff" : "notStaff";
  } catch (err) {
    if (err instanceof ApiUnauthenticatedError) return "signedOut";
    throw err;
  }
}
