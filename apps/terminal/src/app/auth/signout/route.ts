import { NextResponse, type NextRequest } from "next/server";

import { env } from "@/config/env";

// Signs the visitor out through the API (server side, so no CORS) and passes
// on the cookie-clearing headers it sends back.
export async function POST(request: NextRequest) {
  const res = await fetch(`${env.internalApiUrl}/api/auth/logout`, {
    method: "POST",
    headers: { cookie: request.headers.get("cookie") ?? "" },
    cache: "no-store",
  });

  const out = new NextResponse(null, { status: 204 });
  res.headers
    .getSetCookie()
    .forEach(cookie => out.headers.append("set-cookie", cookie));
  return out;
}
