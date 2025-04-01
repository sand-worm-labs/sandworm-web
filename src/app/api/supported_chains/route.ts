import "server-only";
import "@/services/firebase";

import { SupportedChainService } from "@/services/firebase/db/SupportedEntitiesService";
import { DataResult } from "@/services/firebase/db";

export type Chain = {
  name: string;
  short_code: string;
};

// eslint-disable-next-line no-unused-vars
export async function GET(_request: Request): Promise<Response> {
  const result = await SupportedChainService.getAll();
  if (!result.success)
    return new Response(JSON.stringify(result), { status: 500 });
  return new Response(JSON.stringify(result.data));
}

export async function POST(request: Request): Promise<Response> {
  const { chains }: { chains: Chain[] } = await request.json();
  if (
    !Array.isArray(chains) ||
    chains.some(chain => !chain.name || !chain.short_code)
  ) {
    return new Response(
      JSON.stringify(
        DataResult.failure("Invalid chain data", "VALIDATION_ERROR", chains)
      )
    );
  }

  chains.forEach(async chain => {
    await SupportedChainService.create(chain.name, chain.short_code);
  });
  const chainsData = await SupportedChainService.getAll();
  if (!chainsData.success) {
    return new Response(
      JSON.stringify(
        DataResult.failure("Fetching Data Failed", "REQUEST_ERROR")
      )
    );
  }

  return new Response(JSON.stringify(chainsData.data));
}
