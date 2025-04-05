import "server-only";
import "@/services/firebase";

import { QueryService } from "@/services/firebase/db/QueryService";
import { DataResult } from "@/services/firebase/db";
import { UserService } from "@/services/firebase/db/users";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const uid = url.searchParams.get("uid");

  if (!uid) {
    return new Response(
      JSON.stringify(DataResult.failure("Missing UID", "BAD_REQUEST")),
      { status: 400 }
    );
  }

  const userResult = await UserService.findUserById(uid);
  if (!userResult.success) {
    return new Response(JSON.stringify(userResult), { status: 404 });
  }

  const queryResult = await QueryService.findAllUserQuery(uid);

  return new Response(
    JSON.stringify({
      user: userResult.data,
      queries: queryResult.success ? queryResult.data : [], // might need to return error in case of failed query
    }),
    { status: 200 }
  );
}
