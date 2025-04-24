import "server-only";
import "@/services/firebase";

import { QueryService } from "@/services/firebase/db/QueryService";
import {
  DataResult,
  getPaginationDetails,
  toPaginatedResult,
} from "@/services/firebase/db";
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

  const { totalRecords, totalPages, currentPage, nextPage, prevPage } =
    getPaginationDetails(0, 10, 1);
  const emptyResult = toPaginatedResult(
    [],
    totalRecords,
    currentPage,
    totalPages,
    nextPage,
    prevPage
  );

  let queries = null;

  if (queryResult.success) {
    queries = queryResult.data;
  } else if (emptyResult.success) {
    queries = emptyResult.data;
  }

  return new Response(
    JSON.stringify({
      user: userResult.data,
      queries,
    }),
    { status: 200 }
  );
}
