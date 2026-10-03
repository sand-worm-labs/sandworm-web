import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

export type ClientInfo = { name: string; version?: string };

const SESSION_HEADER = 'mcp-session-id';
const MAX_NAME = 100;
const MAX_VERSION = 50;

function toClientInfo(value: unknown): ClientInfo | undefined {
  if (value === null || typeof value !== 'object') return undefined;
  const { title, name, version } = value as { title?: unknown; name?: unknown; version?: unknown };
  // `title` is the display name; `name` is the identifier every client sends.
  const shown = [title, name].find(v => typeof v === 'string' && v.trim()) as string | undefined;
  if (!shown) return undefined;
  return {
    name: shown.trim().slice(0, MAX_NAME),
    version: typeof version === 'string' && version ? version.slice(0, MAX_VERSION) : undefined,
  };
}

const encode = (client: ClientInfo) =>
  `${randomUUID()}.${Buffer.from(JSON.stringify(client)).toString('base64url')}`;

function decode(sessionId: string): ClientInfo | undefined {
  const payload = sessionId.split('.')[1];
  if (!payload) return undefined;
  try {
    return toClientInfo(JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')));
  } catch {
    return undefined;
  }
}

// Clients name themselves once, in `initialize`, but this server keeps nothing
// between requests. So the name is handed back inside the session id, which
// the client then sends with every later request. It names the client's
// software, not the user: the bearer token does that.
export function clientOf(req: IncomingMessage, res: ServerResponse, body: unknown): ClientInfo | undefined {
  const message = body as { method?: unknown; params?: { clientInfo?: unknown } } | null;
  if (message && !Array.isArray(message) && message.method === 'initialize') {
    const client = toClientInfo(message.params?.clientInfo);
    if (client) res.setHeader('Mcp-Session-Id', encode(client));
    return client;
  }
  const sessionId = req.headers[SESSION_HEADER];
  return typeof sessionId === 'string' ? decode(sessionId) : undefined;
}
