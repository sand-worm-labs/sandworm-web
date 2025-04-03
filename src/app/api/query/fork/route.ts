import "server-only";
import "@/services/firebase";

import { QueryService } from "@/services/firebase/db/QueryService";
import { DataResult } from "@/services/firebase/db";

import { auth } from "../../auth/[...nextauth]/auth-options";

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return new Response(
      JSON.stringify(DataResult.failure("Unauthorized", "UNAUTHORIZED")),
      { status: 401 }
    );
  }

  const {
    uid,
    queryId,
  }: {
    uid: string;
    queryId: string;
  } = await request.json();

  if (session.user?.id !== uid) {
    return new Response(
      JSON.stringify(DataResult.failure("Invalid User", "UNAUTHORIZED")),
      { status: 401 }
    );
  }
  const result = await QueryService.fork(queryId, uid);
  if (!result.success)
    return new Response(JSON.stringify(result), { status: 500 });
  return new Response(JSON.stringify(result.data));
}
