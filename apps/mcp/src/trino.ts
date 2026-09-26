// Minimal client for Trino's HTTP statement protocol
// (https://trino.io/docs/current/develop/client-protocol.html): POST the SQL,
// then follow `nextUri` until the query finishes. Kept dependency-free so the
// paid path has as little surface area as possible.

export type TrinoConfig = {
  host: string;
  port: number;
  catalog: string;
  schema: string | null;
  user: string;
  password: string | null;
  httpScheme: 'http' | 'https';
};

export type QueryColumn = { name: string; type: string };

export type QueryResult = {
  columns: QueryColumn[];
  rows: unknown[][];
  // True when the query had more rows than `maxRows` and was cut short.
  truncated: boolean;
};

export type QueryOptions = {
  maxRows: number;
  timeoutMs: number;
  fetch?: typeof fetch;
};

export class TrinoQueryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TrinoQueryError';
  }
}

type StatementResponse = {
  nextUri?: string;
  columns?: QueryColumn[];
  data?: unknown[][];
  error?: { message?: string };
};

// Trino asks clients to wait 50-100ms between polls.
const POLL_INTERVAL_MS = 100;

function buildHeaders(config: TrinoConfig): Record<string, string> {
  const headers: Record<string, string> = {
    'X-Trino-User': config.user,
    'X-Trino-Catalog': config.catalog,
    'X-Trino-Source': 'sandworm-mcp',
  };
  if (config.schema) headers['X-Trino-Schema'] = config.schema;
  if (config.password) {
    headers.Authorization = `Basic ${Buffer.from(`${config.user}:${config.password}`).toString('base64')}`;
  }
  return headers;
}

export async function runTrinoQuery(config: TrinoConfig, sql: string, options: QueryOptions): Promise<QueryResult> {
  const doFetch = options.fetch ?? fetch;
  const headers = buildHeaders(config);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs);

  const columns: QueryColumn[] = [];
  const rows: unknown[][] = [];
  let nextUri: string | undefined;

  // Frees the query on the Trino side when we stop reading early. Best-effort:
  // the result is already decided, so a failed cancel must not change it.
  const cancel = async () => {
    if (!nextUri) return;
    try {
      await doFetch(nextUri, { method: 'DELETE', headers, signal: AbortSignal.timeout(5_000) });
    } catch {
      // ignored on purpose
    }
  };

  try {
    let response = await doFetch(`${config.httpScheme}://${config.host}:${config.port}/v1/statement`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'text/plain' },
      body: sql,
      signal: controller.signal,
    });

    for (;;) {
      if (!response.ok) {
        throw new TrinoQueryError(`Trino responded with HTTP ${response.status}`);
      }

      const body = (await response.json()) as StatementResponse;

      if (body.error) {
        throw new TrinoQueryError(body.error.message ?? 'Query failed');
      }
      if (body.columns && columns.length === 0) columns.push(...body.columns);
      if (body.data) rows.push(...body.data);
      nextUri = body.nextUri;

      if (rows.length >= options.maxRows) {
        const truncated = rows.length > options.maxRows || nextUri !== undefined;
        rows.length = Math.min(rows.length, options.maxRows);
        await cancel();
        return { columns, rows, truncated };
      }

      if (!nextUri) return { columns, rows, truncated: false };

      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
      response = await doFetch(nextUri, { method: 'GET', headers, signal: controller.signal });
    }
  } catch (err) {
    if (err instanceof TrinoQueryError) throw err;
    if (controller.signal.aborted) {
      await cancel();
      throw new TrinoQueryError(`Query timed out after ${options.timeoutMs}ms`);
    }
    throw new TrinoQueryError(`Could not reach Trino: ${err instanceof Error ? err.message : String(err)}`);
  } finally {
    clearTimeout(timer);
  }
}
