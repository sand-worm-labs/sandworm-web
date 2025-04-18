import "server-only";
import "@/services/firebase";

import { DataResult } from "@/services/firebase/db";
import { QueryService } from "@/services/firebase/db/QueryService";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return new Response(
      JSON.stringify(DataResult.failure("Missing ID", "BAD_REQUEST")),
      { status: 400 }
    );
  }

  const result = await QueryService.findOne(id);
  if (!result.success) {
    return new Response(JSON.stringify(result), { status: 500 });
  }

  return new Response(JSON.stringify(result.data), { status: 200 });
}
