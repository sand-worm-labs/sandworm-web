import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { APIResponse } from "@/types";
import { admin } from "@/services/firebase";
import { createSessionCookie } from "@/services/firebase/admin";
import { UserService } from "@/services/firebase/db/users";

export async function POST(request: NextRequest) {
  const auth = admin.auth();
  try {
    const { idToken } = (await request.json()) as { idToken: string };
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

    console.log(idToken);
    // Verify token and get user info
    const decodedToken = await auth.createUser({ uid: idToken });
    const { uid, email } = decodedToken;

    console.log("New User:", uid, email);

    await UserService.create(uid, email || "", "test");
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
