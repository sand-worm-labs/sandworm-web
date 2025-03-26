import "server-only";
import "@/services/firebase";

// import { SupportedChainService } from "@/services/firebase/db/SupportedEntitiesService";
// import { DataResult } from "@/services/firebase/db";

export type Chain = {
  name: string;
  short_code: string;
};

// eslint-disable-next-line no-unused-vars
export async function GET(
  request: Request,
  {
    params,
  }: {
    params: { chain: string };
  }
): Promise<Response> {
  const { chain } = await params;
  console.log(chain);
  //   const result = await SupportedChainService.getAll();
  //   if (!result.success) {
  //     return new Response(JSON.stringify(result), { status: 500 });
  //   }
  //   return new Response(JSON.stringify(result.data));
  return new Response(JSON.stringify([]));
}

export async function POST(
  request: Request,
  {
    params,
  }: {
    params: { chain: string };
  }
): Promise<Response> {
  const { chain } = await params;
  console.log(chain);
  return new Response(JSON.stringify([]));
}
