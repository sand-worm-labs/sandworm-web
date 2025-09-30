import { runQuery } from "./queryclient";

export * from "./formatters";

export async function runPredefinedQuery({
  query,
  signal,
  provider,
}: {
  query: string;
  signal?: AbortSignal;
  provider?: { executionMethod?: string };
}) {
  const executionType = provider?.executionMethod ?? "rpc";
  const API_URL = "https://node.sandwormlabs.xyz/run?";

  try {
    const result = await runQuery(
      API_URL,
      query,
      executionType,
      signal ?? new AbortController().signal
    );
    return result;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
