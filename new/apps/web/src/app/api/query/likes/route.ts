import "server-only";
import "@/services/firebase";

import { QueryService } from "@/services/firebase/db/QueryService";
import { DataResult } from "@/services/firebase/db";
import { auth } from "@/services/auth";

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session) {
    return new Response(
      JSON.stringify(DataResult.failure("Unauthorized", "UNAUTHORIZED")),
      { status: 401 }
    );
  }

  const {
    queryId,
    uid,
    like,
  }: { queryId: string; uid: string; like: boolean } = await request.json();

  if (session.user?.id !== uid) {
    return new Response(
      JSON.stringify(DataResult.failure("Invalid User", "UNAUTHORIZED")),
      { status: 401 }
    );
  }

  if (!queryId || !uid)
    return new Response(
      JSON.stringify(DataResult.failure("Missing query ID.", "MISSING_FIELDS")),
      { status: 400 }
    );

  if (like) {
    const result = await QueryService.star(queryId, uid);
    if (!result.success)
      return new Response(JSON.stringify(result), { status: 500 });
    return new Response(JSON.stringify(result.data));
  }

  const result = await QueryService.unStar(queryId, uid);
  if (!result.success)
    return new Response(JSON.stringify(result), { status: 500 });
  return new Response(JSON.stringify(result.data));
}
