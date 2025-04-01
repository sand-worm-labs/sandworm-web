import "server-only";
import "@/services/firebase";

import { QueryService } from "@/services/firebase/db/QueryService";
import { DataResult } from "@/services/firebase/db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const queryId = url.searchParams.get("queryId");
  if (!queryId)
    return new Response(
      JSON.stringify(DataResult.failure("Missing query ID.", "MISSING_FIELDS")),
      { status: 400 }
    );
  const result = await QueryService.getQueryUpdates(queryId || "");
  if (!result.success)
    return new Response(JSON.stringify(result), { status: 500 });
  return new Response(JSON.stringify(result.data));
}
