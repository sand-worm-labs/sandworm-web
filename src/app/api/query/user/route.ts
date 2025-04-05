import "server-only";
import "@/services/firebase";

import { QueryService } from "@/services/firebase/db/QueryService";
import { DataResult } from "@/services/firebase/db";

import { auth } from "../../auth/[...nextauth]/auth-options";

export async function GET(request: Request) {
  console.log("alive");
  const session = await auth();

  if (!session) {
    return new Response(
      JSON.stringify(DataResult.failure("Unauthorized", "UNAUTHORIZED")),
      { status: 401 }
    );
  }

  const url = new URL(request.url);
  const uid = url.searchParams.get("uid");

  if (session.userId !== uid) {
    console.log("invalid", session, session.userId, uid);
    return new Response(
      JSON.stringify(DataResult.failure("Invalid User", "UNAUTHORIZED")),
      { status: 401 }
    );
  }

  console.log("valid", session, session.userId, uid);

  const result = await QueryService.findAllUserQuery(uid || "");
  console.log("result", result);
  if (!result.success)
    return new Response(JSON.stringify(result), { status: 500 });
  return new Response(JSON.stringify(result.data));
}
