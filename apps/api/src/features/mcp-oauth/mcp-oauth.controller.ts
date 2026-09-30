import { Body, Controller, Get, HttpStatus, Post, Query, Req, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ApiPublic } from '@sandworm/api/decorators/http.decorators';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { AllConfigType } from '@/config/config.type';
import { AuthService } from '@/features/auth/core/auth.service';
import { ACCESS_TOKEN_COOKIE, getTokenFromCookie } from '@/features/auth/core/utils/cookie';
import { AuthorizeParams, McpOauthService } from './mcp-oauth.service';

// The OAuth 2.1 authorization server for apps/mcp (see the phased plan in
// memory: apps/mcp is the resource server, this is the authorization
// server). Deliberately not part of the versioned/documented public API
// surface (ApiExcludeController) — these are machine/browser endpoints
// following the OAuth spec's own shapes, not our usual REST conventions.
//
// The token/introspect bodies here are JSON, not the RFC's usual
// application/x-www-form-urlencoded — both sides (apps/mcp and this
// controller) are ours, and Fastify has no form-urlencoded parser
// registered, so this avoids adding one just for two internal endpoints.
@ApiExcludeController()
@Controller('oauth')
export class McpOauthController {
  constructor(
    private readonly mcpOauth: McpOauthService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  @Post('register')
  @ApiPublic({ summary: 'RFC 7591 Dynamic Client Registration — any MCP client can call this to get a client_id' })
  async register(
    @Body() body: { redirect_uris?: unknown; client_name?: unknown },
    @Res() reply: FastifyReply,
  ): Promise<void> {
    try {
      const client = await this.mcpOauth.registerClient(body);
      reply.status(HttpStatus.CREATED).send(client);
    } catch (err) {
      reply.status(HttpStatus.BAD_REQUEST).send({ error: 'invalid_client_metadata', error_description: (err as Error).message });
    }
  }

  @Get('authorize')
  @ApiPublic({ summary: 'Start the MCP OAuth authorization flow (browser-facing)' })
  async authorize(
    @Query() query: Record<string, unknown>,
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    let params: AuthorizeParams;
    try {
      params = await this.mcpOauth.validateAuthorizeParams(query);
    } catch (err) {
      reply.status(HttpStatus.BAD_REQUEST).send({ error: 'invalid_request', error_description: (err as Error).message });
      return;
    }

    const session = await this.getSession(req);
    if (!session) {
      const appUrl = this.configService.getOrThrow('app.url', { infer: true });
      const frontendDomain = this.configService.getOrThrow('app.frontendDomain', { infer: true });
      const returnTo = `${appUrl}${req.url}`;
      reply.redirect(`${frontendDomain}/signin?callback=${encodeURIComponent(returnTo)}`);
      return;
    }

    reply.type('text/html').send(this.renderConsentPage(params, session.user.email ?? session.user.id));
  }

  @Post('authorize/confirm')
  @ApiPublic({ summary: 'Confirm or deny the MCP OAuth consent screen' })
  async confirm(
    @Body() body: Record<string, unknown> & { decision: 'allow' | 'deny' },
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    let params: AuthorizeParams;
    try {
      params = await this.mcpOauth.validateAuthorizeParams(body);
    } catch (err) {
      reply.status(HttpStatus.BAD_REQUEST).send({ error: 'invalid_request', error_description: (err as Error).message });
      return;
    }

    const session = await this.getSession(req);
    if (!session) {
      // Session cookie expired between rendering the form and submitting
      // it — send them through /authorize again rather than failing here.
      reply.status(HttpStatus.UNAUTHORIZED).send({ error: 'login_required' });
      return;
    }

    const redirect = new URL(params.redirectUri);
    if (body.decision !== 'allow') {
      redirect.searchParams.set('error', 'access_denied');
      if (params.state) redirect.searchParams.set('state', params.state);
      reply.send({ redirectTo: redirect.toString() });
      return;
    }

    const code = await this.mcpOauth.issueCode(params, session.id);
    redirect.searchParams.set('code', code);
    if (params.state) redirect.searchParams.set('state', params.state);
    reply.send({ redirectTo: redirect.toString() });
  }

  @Post('token')
  @ApiPublic({ summary: 'Exchange an authorization code for an access token' })
  async token(
    @Body()
    body: {
      grant_type: string;
      code: string;
      code_verifier: string;
      redirect_uri: string;
      client_id: string;
    },
    @Res() reply: FastifyReply,
  ): Promise<void> {
    if (body.grant_type !== 'authorization_code') {
      reply.status(HttpStatus.BAD_REQUEST).send({ error: 'unsupported_grant_type' });
      return;
    }

    try {
      const tokens = await this.mcpOauth.exchangeCode({
        code: body.code,
        codeVerifier: body.code_verifier,
        redirectUri: body.redirect_uri,
        clientId: body.client_id,
      });

      reply.send({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        token_type: 'Bearer',
        expires_in: tokens.expiresIn,
      });
    } catch (err) {
      reply.status(HttpStatus.BAD_REQUEST).send({ error: 'invalid_grant', error_description: (err as Error).message });
    }
  }

  @Post('introspect')
  @ApiPublic({ summary: "Validate a bearer token on apps/mcp's behalf" })
  async introspect(
    @Body() body: { token: string },
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    const presentedKey = req.headers['x-introspect-key'];
    try {
      const result = await this.mcpOauth.introspect(body.token, typeof presentedKey === 'string' ? presentedKey : '');
      reply.send(result);
    } catch (err) {
      reply.status(HttpStatus.BAD_REQUEST).send({ error: (err as Error).message });
    }
  }

  private async getSession(req: FastifyRequest) {
    const token = getTokenFromCookie(req, ACCESS_TOKEN_COOKIE);
    if (!token) return null;
    return this.authService.validateTokenAndGetUser(token);
  }

  private renderConsentPage(params: AuthorizeParams, accountLabel: string): string {
    // Field names match the OAuth query params verbatim (snake_case) so the
    // submitted body needs no translation before hitting
    // validateAuthorizeParams again in confirm().
    const hidden = (name: string, value: string | undefined) =>
      value ? `<input type="hidden" name="${name}" value="${this.escapeHtml(value)}">` : '';
    // Falls back to a generic label for a client that registered (RFC 7591)
    // without a client_name, or the pre-registered client (which has none).
    const clientLabel = this.escapeHtml(params.clientName ?? 'This app');

    // Deliberately plain, server-rendered HTML rather than the app's real
    // design system — a full apps/web consent page (matching the app's real
    // chrome) is the natural next step here, not built in this pass. Login
    // itself already goes through the real /signin page unchanged.
    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Connect to Sandworm</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, system-ui, sans-serif; background: #0b0b0c; color: #eee; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    main { max-width: 360px; padding: 2rem; text-align: center; }
    h1 { font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem; }
    p { color: #999; font-size: 0.9rem; line-height: 1.4; }
    .actions { display: flex; gap: 0.75rem; margin-top: 1.5rem; }
    button { flex: 1; padding: 0.65rem 1rem; border-radius: 8px; border: 1px solid #333; font-size: 0.9rem; cursor: pointer; }
    button[name="decision"][value="allow"] { background: #fff; color: #000; border: none; }
    button[name="decision"][value="deny"] { background: transparent; color: #eee; }
  </style>
</head>
<body>
  <main>
    <h1>${clientLabel} wants to access your Sandworm account</h1>
    <p>Signed in as ${this.escapeHtml(accountLabel)}. ${clientLabel} will be able to create and run notebooks in your workspace.</p>
    <form id="consent-form">
      ${hidden('response_type', params.responseType)}
      ${hidden('client_id', params.clientId)}
      ${hidden('redirect_uri', params.redirectUri)}
      ${hidden('code_challenge', params.codeChallenge)}
      ${hidden('code_challenge_method', params.codeChallengeMethod)}
      ${hidden('resource', params.resource)}
      ${hidden('state', params.state)}
      ${hidden('scope', params.scope)}
      <div class="actions">
        <button type="submit" name="decision" value="deny">Deny</button>
        <button type="submit" name="decision" value="allow">Allow</button>
      </div>
    </form>
  </main>
  <script>
    document.getElementById('consent-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const decision = e.submitter.value;
      const form = new FormData(e.target);
      const body = Object.fromEntries(form.entries());
      body.decision = decision;
      const res = await fetch('/api/oauth/authorize/confirm', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.redirectTo) window.location.href = data.redirectTo;
    });
  </script>
</body>
</html>`;
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
