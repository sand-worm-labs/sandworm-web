import type { ToolContext } from './graphql.ts';

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

export async function rest<T>(ctx: ToolContext, method: 'GET' | 'POST' | 'PUT', path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${ctx.apiUrl}/api${path}`, {
    method,
    headers: {
      Cookie: `access_token=${ctx.auth.token}`,
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  });

  const json = (await res.json().catch(() => null)) as (T & ErrorBody) | null;
  if (!res.ok || json === null) throw new RestError(describe(json, res.status));
  return json;
}
