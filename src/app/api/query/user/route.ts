import "server-only";
import "@/services/firebase";

import { QueryService } from "@/services/firebase/db/QueryService";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const uid = url.searchParams.get("uid");

  const result = await QueryService.findAllUserQuery(uid || "");
  if (!result.success)
    return new Response(JSON.stringify(result), { status: 500 });
  return new Response(JSON.stringify(result.data));
}
