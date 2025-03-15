import { cookies } from "next/headers";
import type { SessionCookieOptions } from "firebase-admin/auth";

import { admin } from "@/services/firebase";

const auth = admin.auth();

async function getSession() {
  try {
    const cookieJar = await cookies();
    return cookieJar.get("__session")?.value;
  } catch (error) {
    return undefined;
  }
}

export async function isUserAuthenticated(
  session: string | undefined = undefined
) {
  const _session = session ?? (await getSession());
  if (!_session) return false;

  try {
    const isRevoked = !(await auth.verifySessionCookie(_session, true));
    return !isRevoked;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function getCurrentUser() {
  const session = await getSession();

  if (!(await isUserAuthenticated(session))) {
    return null;
  }

  const decodedIdToken = await auth.verifySessionCookie(session!);
  const currentUser = await auth.getUser(decodedIdToken.uid);

  return currentUser;
}

export async function createSessionCookie(
  idToken: string,
  sessionCookieOptions: SessionCookieOptions
) {
  return auth.createSessionCookie(idToken, sessionCookieOptions);
}

export async function revokeAllSessions(session: string) {
  const decodedIdToken = await auth.verifySessionCookie(session);
  return auth.revokeRefreshTokens(decodedIdToken.sub);
}
