import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import type { APIResponse } from "@/types";
import { revokeAllSessions } from "@/services/firebase/admin";

export async function GET() {
  const cookieJar = await cookies();
  const sessionCookie = cookieJar.get("__session")?.value;
  if (!sessionCookie)
    return NextResponse.json<APIResponse<string>>(
      { success: false, error: "Session not found." },
      { status: 400 }
    );

  cookieJar.delete("__session");

  await revokeAllSessions(sessionCookie);

  return NextResponse.json<APIResponse<string>>({
    success: true,
    data: "Signed out successfully.",
  });
}
