import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { APIResponse } from "@/types";
import { admin } from "@/services/firebase";
import { createSessionCookie } from "@/services/firebase/admin";

export async function POST(request: NextRequest) {
  console.log(process.env.NODE_ENV);
  try {
    const { idToken } = (await request.json()) as { idToken: string };
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    console.log(idToken);
    // Verify token and get user info
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    console.log(uid, email, name, picture);

    // Optionally: Check if the user exists in DB, create if not
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
      data: "Signed in successfully.",
    });
  } catch (error) {
    console.error("Sign-in error:", error);
    return NextResponse.json<APIResponse<string>>(
      { success: false, error: "Sign-in failed." },
      { status: 400 }
    );
  }
}
