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

  const staredResult = await QueryService.findAllUserStaredQuery(uid);

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

  let starredQueries = null;

  if (staredResult.success) {
    starredQueries = staredResult.data;
  } else if (emptyResult.success) {
    starredQueries = emptyResult.data;
  }

  return new Response(JSON.stringify(starredQueries), { status: 200 });
}
