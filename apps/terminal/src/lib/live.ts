import { cookies } from "next/headers";

import { PREVIEW_CLIENT_COOKIE } from "@/features/preview/cookies";

import { ApiUnauthenticatedError } from "./api";

// Live data for a signed-in member of a terminal client, the preview fixtures
// for everyone else: signed-out visitors, people before their first setup save
// (`load` returns null), and anyone who picked a preview client at /dev/preview.
export async function liveOr<T>(
  load: () => Promise<T | null>,
  fixture: () => T | Promise<T>
): Promise<T> {
  if ((await cookies()).has(PREVIEW_CLIENT_COOKIE)) return fixture();
  try {
    return (await load()) ?? (await fixture());
  } catch (err) {
    if (err instanceof ApiUnauthenticatedError) return fixture();
    throw err;
  }
}
