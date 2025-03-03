import { NextResponse } from "next/server";

import { getCurrentUser } from "@/services/firebase/admin";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, user });
}
