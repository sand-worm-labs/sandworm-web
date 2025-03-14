import "server-only";

import { cookies } from "next/headers";
import * as admin from "firebase-admin";
import type { SessionCookieOptions } from "firebase-admin/auth";

if (process.env.NODE_ENV === "test") {
  throw new Error(
    `This will connect to the production Firestore. 
     Make sure db/firebase.ts is updated before testing against Firebase.`
  );
}

if (!admin.apps.length) {
  if (
    process.env.NODE_ENV === "development" &&
    process.env.FIRESTORE_EMULATOR_HOST
  ) {
    console.log("Using Firebase **emulator** DB");
    admin.initializeApp({
      projectId: "sandworm-8aa45",
      storageBucket: "sandworm-8aa45.appspot.com",
    });
    // seedDatabase();
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log("Using Firebase live DB");
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      storageBucket: "sandworm-8aa45.appspot.com",
    });
  } else {
    admin.initializeApp({
      storageBucket: "sandworm-8aa45.appspot.com",
    });
  }
}

export const auth = admin.auth();

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
