import { randomBytes, createHash } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { McpOauthService } from '../mcp-oauth.service';

// End-to-end exercise of the whole register -> authorize -> code -> token ->
// introspect flow, with no Postgres/Redis/HTTP server involved: RedisService
// is an in-memory Map, and AuthService is a real @nestjs/jwt sign/verify
// against one fake in-memory user. The JWT round-trip is real; only the
// Postgres user lookup and the network transport are faked.
const SECRET = 'test-secret';
const FAKE_USER = { id: 'user-123', email: 'dev@example.com' };

function base64url(input: Buffer): string {
  return input.toString('base64url');
}

function makeService() {
  const config = {
    getOrThrow: (key: string) => {
      if (key === 'mcpOauth') return { resource: 'http://localhost:3101/mcp', introspectKey: 'test-introspect-key' };
      throw new Error(`unexpected config key ${key}`);
    },
  } as any;

  const store = new Map<string, string>();
  const redis = {
    get: async (k: string) => store.get(k) ?? null,
    set: async (k: string, v: string) => void store.set(k, v),
    del: async (k: string) => void store.delete(k),
  } as any;

  const jwt = new JwtService({});
  const authService = {
    issueTokenPair: async (userId: string) => {
      const [accessToken, refreshToken] = await Promise.all([
        jwt.signAsync({ sub: userId }, { secret: SECRET, expiresIn: '15m' }),
        jwt.signAsync({ sub: userId }, { secret: SECRET, expiresIn: '7d' }),
      ]);
      const now = Date.now();
      return {
        accessToken,
        refreshToken,
        accessTokenExpires: new Date(now + 15 * 60 * 1000),
        refreshTokenExpires: new Date(now + 7 * 24 * 60 * 60 * 1000),
      };
    },
    validateTokenAndGetUser: async (token: string) => {
      try {
        const payload = await jwt.verifyAsync<{ sub: string }>(token, { secret: SECRET });
        if (payload.sub !== FAKE_USER.id) return null;
        return { id: FAKE_USER.id, hash: token, user: FAKE_USER, roles: [] };
      } catch {
        return null;
      }
    },
  } as any;

  return { service: new McpOauthService(config, redis, authService) };
}

async function registerAndAuthorize(service: McpOauthService) {
  const client = await service.registerClient({
    redirect_uris: ['http://127.0.0.1:9999/callback'],
    client_name: 'Test Client',
  });

  const codeVerifier = base64url(randomBytes(32));
  const codeChallenge = base64url(createHash('sha256').update(codeVerifier).digest());
  const authorizeParams = await service.validateAuthorizeParams({
    response_type: 'code',
    client_id: client.client_id,
    redirect_uri: client.redirect_uris[0],
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    resource: 'http://localhost:3101/mcp',
    state: 'xyz',
  });

  return { client, codeVerifier, authorizeParams };
}

describe('McpOauthService', () => {
  it('runs the full register -> authorize -> code -> token -> introspect flow', async () => {
    const { service } = makeService();
    const { client, codeVerifier, authorizeParams } = await registerAndAuthorize(service);

    expect(authorizeParams.clientName).toBe('Test Client');

    const code = await service.issueCode(authorizeParams, FAKE_USER.id);
    const tokens = await service.exchangeCode({
      code,
      codeVerifier,
      redirectUri: client.redirect_uris[0],
      clientId: client.client_id,
    });
    expect(tokens.accessToken).toEqual(expect.any(String));

    const introspected = await service.introspect(tokens.accessToken, 'test-introspect-key');
    expect(introspected).toEqual({ active: true, sub: FAKE_USER.id, email: FAKE_USER.email });
  });

  it('rejects a replayed authorization code', async () => {
    const { service } = makeService();
    const { client, codeVerifier, authorizeParams } = await registerAndAuthorize(service);
    const code = await service.issueCode(authorizeParams, FAKE_USER.id);

    const exchange = () =>
      service.exchangeCode({ code, codeVerifier, redirectUri: client.redirect_uris[0], clientId: client.client_id });

    await exchange();
    await expect(exchange()).rejects.toThrow(/invalid, expired, or already used/);
  });

  it('rejects a code exchange with the wrong PKCE verifier', async () => {
    const { service } = makeService();
    const { client, authorizeParams } = await registerAndAuthorize(service);
    const code = await service.issueCode(authorizeParams, FAKE_USER.id);

    await expect(
      service.exchangeCode({
        code,
        codeVerifier: 'not-the-right-verifier',
        redirectUri: client.redirect_uris[0],
        clientId: client.client_id,
      }),
    ).rejects.toThrow(/code_verifier does not match/);
  });

  it('rejects introspection with the wrong shared key', async () => {
    const { service } = makeService();
    const { client, codeVerifier, authorizeParams } = await registerAndAuthorize(service);
    const code = await service.issueCode(authorizeParams, FAKE_USER.id);
    const tokens = await service.exchangeCode({
      code,
      codeVerifier,
      redirectUri: client.redirect_uris[0],
      clientId: client.client_id,
    });

    await expect(service.introspect(tokens.accessToken, 'wrong-key')).rejects.toThrow(/Invalid introspection key/);
  });

  it('rejects an unregistered client_id at /authorize', async () => {
    const { service } = makeService();

    await expect(
      service.validateAuthorizeParams({
        response_type: 'code',
        client_id: 'never-registered',
        redirect_uri: 'http://127.0.0.1:9999/callback',
        code_challenge: 'x',
        code_challenge_method: 'S256',
        resource: 'http://localhost:3101/mcp',
      }),
    ).rejects.toThrow(/Unknown client_id/);
  });

  it("rejects a redirect_uri that wasn't registered for the client", async () => {
    const { service } = makeService();
    const client = await service.registerClient({ redirect_uris: ['http://127.0.0.1:9999/callback'] });

    await expect(
      service.validateAuthorizeParams({
        response_type: 'code',
        client_id: client.client_id,
        redirect_uri: 'http://evil.example/callback',
        code_challenge: 'x',
        code_challenge_method: 'S256',
        resource: 'http://localhost:3101/mcp',
      }),
    ).rejects.toThrow(/redirect_uri is not registered/);
  });
});
