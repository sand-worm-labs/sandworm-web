import "server-only";
import "@/services/firebase";

import { QueryService } from "@/services/firebase/db/QueryService";

export async function POST(request: Request) {
  const {
    uid,
    queryId,
  }: {
    uid: string;
    queryId: string;
  } = await request.json();
  const result = await QueryService.fork(queryId, uid);
  if (!result.success)
    return new Response(JSON.stringify(result), { status: 500 });
  return new Response(JSON.stringify(result.data));
}
