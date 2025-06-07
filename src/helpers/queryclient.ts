import { formatApiResultToQueryResult, queryHasResults } from ".";

export interface QueryResult {
  columns: string[];
  columnTypes: string[];
  data: Record<string, unknown>[];
  rowCount: number;
  error?: string;
}

function emptyResult(error: string): QueryResult {
  return {
    columns: [],
    columnTypes: [],
    data: [],
    rowCount: 0,
    error,
  };
}

export async function runQuery(
  apiUrl: string,
  query: string,
  executionType: string,
  signal: AbortSignal
): Promise<QueryResult> {
  try {
    const formattedQuery = query.replace(/\s/g, "+");
    const res = await fetch(
      `${apiUrl}type_param=${executionType}&query=${formattedQuery}`,
      { signal }
    );
    const resContentType = res.headers.get("Content-Type");

    if (!resContentType?.includes("application/json")) {
      const text = await res.text();
      throw new Error(
        `Unexpected content type: ${resContentType}. Body: ${text}`
      );
    }

    const { data, error, type } = await res.json();
    console.log("response", data, type);

    if (error) {
      console.error("API returned error:", error);
      return emptyResult(error);
    }

    const resultData =
      executionType === "indexed" ? data[0]?.result?.indexed : data[0]?.result;

    if (!queryHasResults(resultData)) {
      return emptyResult("No results");
    }

    return formatApiResultToQueryResult(resultData);
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      console.warn("Query was aborted by the user");
      throw new Error("QueryAborted");
    }

    console.error("Fetch error:", err);
    return emptyResult(
      err instanceof Error ? err.message : "Unknown fetch error"
    );
  }
}
