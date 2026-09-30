import { randomBytes, createHash, timingSafeEqual } from 'crypto';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '@/config/config.type';
import { RedisService } from '@/infrastructure/redis/redis.service';
import { AuthService } from '@/features/auth/core/auth.service';

// One authorize→token round trip. Stored in Redis (not Postgres) because a
// code is single-use and lives for minutes, not a durable record.
type PendingAuthorization = {
  userId: string;
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  resource: string;
  scope?: string;
};

export type AuthorizeParams = {
  responseType: string;
  clientId: string;
  clientName?: string;
  redirectUri: string;
  codeChallenge: string;
  codeChallengeMethod: string;
  resource: string;
  state?: string;
  scope?: string;
};

// A client registered via RFC 7591 (POST /oauth/register) — any MCP client
// (Claude, Codex, Cursor, ...) self-registers the first time it connects,
// instead of only the one client we'd otherwise have to hand-configure.
// Stored durably (no TTL): a client registers once and reuses the same
// client_id on every future login, the same way it would with a real IdP.
type RegisteredClient = {
  clientId: string;
  redirectUris: string[];
  clientName?: string;
};

const CODE_TTL_SECONDS = 5 * 60;
const CODE_PREFIX = 'mcp-oauth:code:';
const CLIENT_PREFIX = 'mcp-oauth:client:';

function base64url(input: Buffer): string {
  return input.toString('base64url');
}

@Injectable()
export class McpOauthService {
  private readonly logger = new Logger(McpOauthService.name);

  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly redis: RedisService,
    private readonly authService: AuthService,
  ) {}

  // RFC 7591 Dynamic Client Registration: any MCP client can call this once
  // to get its own client_id, instead of us hand-registering every client
  // (Claude, Codex, Cursor, ...) up front. redirect_uris is the only thing
  // we actually rely on later (checked against on every /authorize call).
  async registerClient(body: {
    redirect_uris?: unknown;
    client_name?: unknown;
  }): Promise<{ client_id: string; redirect_uris: string[]; client_name?: string; token_endpoint_auth_method: 'none' }> {
    const redirectUris = Array.isArray(body.redirect_uris) ? body.redirect_uris.map(String) : [];
    if (redirectUris.length === 0) {
      throw new BadRequestException('redirect_uris is required and must be a non-empty array');
    }
    for (const uri of redirectUris) {
      try {
        new URL(uri);
      } catch {
        throw new BadRequestException(`redirect_uris contains an invalid URI: ${uri}`);
      }
    }

    const clientId = base64url(randomBytes(16));
    const clientName = body.client_name ? String(body.client_name) : undefined;
    const client: RegisteredClient = { clientId, redirectUris, clientName };

    await this.redis.set(CLIENT_PREFIX + clientId, JSON.stringify(client));
    this.logger.log(`Registered MCP OAuth client ${clientId} (${clientName ?? 'unnamed'})`);

    // token_endpoint_auth_method 'none': MCP clients are public clients that
    // prove themselves with PKCE, not a client_secret (OAuth 2.1 guidance
    // for clients that can't keep a secret confidential).
    return { client_id: clientId, redirect_uris: redirectUris, client_name: clientName, token_endpoint_auth_method: 'none' };
  }

  // Every client goes through /oauth/register (RFC 7591) — including our own
  // first-party integrations, no special-cased pre-registered client. One
  // path, works the same for Claude, Codex, Cursor, or us.
  private async getClient(clientId: string): Promise<RegisteredClient | null> {
    const raw = await this.redis.get(CLIENT_PREFIX + clientId);
    return raw ? (JSON.parse(raw) as RegisteredClient) : null;
  }

  // Validates everything about the request that doesn't require the user to
  // be logged in yet — client_id, redirect_uri and PKCE must all check out
  // *before* we show a login/consent screen, per the spec (an attacker
  // shouldn't be able to get a real user to approve a bogus redirect_uri).
  async validateAuthorizeParams(query: Record<string, unknown>): Promise<AuthorizeParams> {
    const config = this.configService.getOrThrow('mcpOauth', { infer: true });

    const responseType = String(query.response_type ?? '');
    const clientId = String(query.client_id ?? '');
    const redirectUri = String(query.redirect_uri ?? '');
    const codeChallenge = String(query.code_challenge ?? '');
    const codeChallengeMethod = String(query.code_challenge_method ?? '');
    const resource = String(query.resource ?? '');
    const state = query.state ? String(query.state) : undefined;
    const scope = query.scope ? String(query.scope) : undefined;

    if (responseType !== 'code') {
      throw new BadRequestException('response_type must be "code"');
    }

    const client = await this.getClient(clientId);
    if (!client) {
      throw new BadRequestException('Unknown client_id — register it first via POST /oauth/register');
    }
    if (!client.redirectUris.includes(redirectUri)) {
      throw new BadRequestException('redirect_uri is not registered for this client');
    }
    if (!codeChallenge) {
      throw new BadRequestException('code_challenge is required (PKCE)');
    }
    if (codeChallengeMethod !== 'S256') {
      throw new BadRequestException('code_challenge_method must be "S256"');
    }
    if (resource !== config.resource) {
      throw new BadRequestException('resource does not match this authorization server\'s MCP server');
    }

    return {
      responseType,
      clientId,
      clientName: client.clientName,
      redirectUri,
      codeChallenge,
      codeChallengeMethod,
      resource,
      state,
      scope,
    };
  }

  // Called once the user has approved the consent screen. Issues a one-time
  // code the client (via apps/mcp) will exchange for a real token.
  async issueCode(params: AuthorizeParams, userId: string): Promise<string> {
    const code = base64url(randomBytes(32));
    const pending: PendingAuthorization = {
      userId,
      clientId: params.clientId,
      redirectUri: params.redirectUri,
      codeChallenge: params.codeChallenge,
      resource: params.resource,
      scope: params.scope,
    };

    await this.redis.set(CODE_PREFIX + code, JSON.stringify(pending), CODE_TTL_SECONDS);
    return code;
  }

  // Exchanges a code for the same access/refresh token pair the web app's
  // own login issues (AuthService.issueTokenPair) — apps/mcp validates it the
  // same way any other Sandworm bearer token is validated, via introspect().
  async exchangeCode(params: {
    code: string;
    codeVerifier: string;
    redirectUri: string;
    clientId: string;
  }): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const key = CODE_PREFIX + params.code;
    const raw = await this.redis.get(key);
    if (!raw) {
      throw new BadRequestException('Authorization code is invalid, expired, or already used');
    }
    // One-time use: delete immediately so a replayed code always fails, even
    // if the rest of validation below also fails on this first attempt.
    await this.redis.del(key);

    const pending = JSON.parse(raw) as PendingAuthorization;

    if (pending.clientId !== params.clientId) {
      throw new BadRequestException('client_id does not match the one used to request this code');
    }
    if (pending.redirectUri !== params.redirectUri) {
      throw new BadRequestException('redirect_uri does not match the one used to request this code');
    }
    if (!this.verifyPkce(params.codeVerifier, pending.codeChallenge)) {
      throw new BadRequestException('code_verifier does not match code_challenge');
    }

    const tokens = await this.authService.issueTokenPair(pending.userId);
    const expiresIn = Math.max(
      0,
      Math.floor((tokens.accessTokenExpires.getTime() - Date.now()) / 1000),
    );

    return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, expiresIn };
  }

  // apps/mcp calls this per request (it holds no JWT-verification secret of
  // its own) to find out whether a bearer token is a valid, current Sandworm
  // session and who it belongs to.
  async introspect(
    token: string,
    presentedKey: string,
  ): Promise<{ active: boolean; sub?: string; email?: string }> {
    const config = this.configService.getOrThrow('mcpOauth', { infer: true });
    if (!this.constantTimeEquals(presentedKey, config.introspectKey)) {
      throw new BadRequestException('Invalid introspection key');
    }

    const session = await this.authService.validateTokenAndGetUser(token);
    if (!session) return { active: false };
    return { active: true, sub: session.id, email: session.user.email };
  }

  private verifyPkce(codeVerifier: string, codeChallenge: string): boolean {
    if (!codeVerifier) return false;
    const computed = base64url(createHash('sha256').update(codeVerifier).digest());
    return this.constantTimeEquals(computed, codeChallenge);
  }

  private constantTimeEquals(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  }
}
