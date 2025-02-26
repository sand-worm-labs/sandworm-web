import "server-only";

import { cookies } from "next/headers";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import type { SessionCookieOptions } from "firebase-admin/auth";
import { getAuth } from "firebase-admin/auth";

const serviceAccount = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT;

if (!serviceAccount) {
  throw new Error(
    "FIREBASE_ADMIN_SERVICE_ACCOUNT environment variable is not defined."
  );
}

export const firebaseApp =
  getApps().find(it => it.name === "firebase-admin-app") ||
  initializeApp(
    {
      credential: cert(serviceAccount),
    },
    "firebase-admin-app"
  );
export const auth = getAuth(firebaseApp);

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
