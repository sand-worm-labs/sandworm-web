import "server-only";
import "@/services/firebase";


import { QueryService} from "@/services/firebase/db/QueryService";

export async function GET(
    request: Request,
    { params }: { params: { queryId: string } }
  ) {
    const url = new URL(request.url);
    const queryId = url.searchParams.get("queryId");
    const result = await QueryService.getQueryUpdates(queryId || "");
    if (!result.success) return new Response(JSON.stringify(result), { status: 500 });
    return new Response(JSON.stringify(result.data));
}
