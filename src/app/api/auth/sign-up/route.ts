import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { APIResponse } from "@/types";
import { auth, createSessionCookie } from "@/services/firebase/admin";

export async function POST(request: NextRequest) {
  try {
    const { idToken } = (await request.json()) as { idToken: string };
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

    // Verify token and get user info
    const decodedToken = await auth.verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    console.log("New User:", uid, email, name, picture);

    // TODO: Optionally create the user in the DB if needed
    // await checkOrCreateUser({ uid, email, name, picture });

    // Create session cookie
    const sessionCookie = await createSessionCookie(idToken, { expiresIn });

    const cookieJar = await cookies();
    await cookieJar.set("__session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: true,
    });

    return NextResponse.json<APIResponse<string>>({
      success: true,
      data: "Account created successfully.",
    });
  } catch (error) {
    console.error("Sign-up error:", error);
    return NextResponse.json<APIResponse<string>>(
      { success: false, error: "Sign-up failed." },
      { status: 400 }
    );
  }
}
