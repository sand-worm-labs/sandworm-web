import type { ToolContext } from './graphql.ts';
import { callApi } from './lane.ts';

export class RestError extends Error {}

type ErrorBody = { message?: unknown } | null;

// Class-validator failures arrive as a list of { property, constraints }.
function describe(body: ErrorBody, status: number): string {
  const message = body?.message;
  if (typeof message === 'string') return message;
  if (Array.isArray(message)) {
    const lines = message.flatMap((m: { property?: string; constraints?: Record<string, string> }) =>
      Object.values(m.constraints ?? {}).map(c => (m.property ? `${m.property}: ${c}` : c)),
    );
    if (lines.length) return lines.join('; ');
  }
  return `Sandworm API returned ${status}`;
}

const DEFAULT_TIMEOUT_MS = 30_000;

export async function rest<T>(
  ctx: ToolContext,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown,
  // For endpoints that hold the request open on purpose, such as waiting on a run.
  { timeoutMs = DEFAULT_TIMEOUT_MS }: { timeoutMs?: number } = {},
): Promise<T> {
  const res = await callApi({ userId: ctx.auth.userId, token: ctx.auth.token, apiUrl: ctx.apiUrl }, {
    method,
    path: `/api${path}`,
    body,
    timeoutMs,
  });

  const json = res.json as (T & ErrorBody) | null;
  if (res.status < 200 || res.status >= 300 || json === null) throw new RestError(describe(json, res.status));
  return json;
}
