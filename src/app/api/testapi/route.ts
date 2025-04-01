// This is a temporary file created to simulate functions on the API.
// This is not to replace tests needed to be run, just a simulation.

import { UserService } from "@/services/firebase/db/UserService";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    const user = await UserService.findUserByEmail(email);

    if (!user.success) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.data.id || "",
      name: user.data.name || user.data.username,
      email: user.data.email,
      emailVerified: user.data.emailVerified || null,
      image: user.data.image,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
