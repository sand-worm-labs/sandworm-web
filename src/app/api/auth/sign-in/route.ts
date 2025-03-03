import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { APIResponse } from "@/types";
import { createSessionCookie } from "@/services/firebase/admin";

export async function POST(request: NextRequest) {
  const { idToken } = (await request.json()) as { idToken: string };

  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

  const sessionCookie = await createSessionCookie(idToken, { expiresIn });

  const cookieJar = await cookies();
  cookieJar.set("__session", sessionCookie, {
    maxAge: expiresIn,
    httpOnly: true,
    secure: true,
  });

  return NextResponse.json<APIResponse<string>>({
    success: true,
    data: "Signed in successfully.",
  });
}
