import "server-only";
import "@/services/firebase";

// import { SupportedChainService } from "@/services/firebase/db/SupportedEntitiesService";
// import { DataResult } from "@/services/firebase/db";

export type Chain = {
  name: string;
  short_code: string;
};

// eslint-disable-next-line no-unused-vars
export async function GET({
  params,
}: {
  params: Promise<{ chain_shortcode: string }>;
}): Promise<Response> {
  console.log(params);
  //   const result = await SupportedChainService.getAll();
  //   if (!result.success) {
  //     return new Response(JSON.stringify(result), { status: 500 });
  //   }
  //   return new Response(JSON.stringify(result.data));
  return new Response(JSON.stringify([]));
}

export async function POST({
  params,
}: {
  params: Promise<{ chain_shortcode: string }>;
}): Promise<Response> {
  console.log(params);
  return new Response(JSON.stringify([]));
}
