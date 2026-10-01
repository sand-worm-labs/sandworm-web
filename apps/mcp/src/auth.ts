import type { IncomingMessage } from 'node:http';

import type { Config } from './config.ts';

// Who is calling. `token` is forwarded to the Sandworm API so tools act as
// this user and nothing more.
export type AuthContext = {
  userId: string;
  email?: string;
  token: string;
};

export type Authenticator = (req: IncomingMessage) => Promise<AuthContext | null>;

function bearerToken(req: IncomingMessage): string | null {
  const header = req.headers.authorization;
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  return scheme?.toLowerCase() === 'bearer' && token ? token : null;
}

// This server holds no JWT secret: every request's token is checked against
// the API's introspection endpoint, which also tells us if the session was
// revoked. Returns null for anything that isn't a valid, active token.
export function createAuthenticator(config: Pick<Config, 'apiUrl' | 'introspectKey'>): Authenticator {
  return async req => {
    const token = bearerToken(req);
    if (!token) return null;

    try {
      const res = await fetch(`${config.apiUrl}/api/oauth/introspect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-introspect-key': config.introspectKey },
        body: JSON.stringify({ token }),
        signal: AbortSignal.timeout(5_000),
      });
      if (!res.ok) {
        console.error(`Token introspection failed: API returned ${res.status}`);
        return null;
      }
      const body = (await res.json()) as { active?: boolean; sub?: string; email?: string };
      if (!body.active || !body.sub) return null;
      return { userId: body.sub, email: body.email, token };
    } catch (err) {
      console.error('Token introspection failed', err);
      return null;
    }
  };
}
