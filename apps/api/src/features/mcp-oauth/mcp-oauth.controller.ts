import { Body, Controller, Get, HttpStatus, Post, Query, Req, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ApiPublic } from '@sandworm/api/decorators/http.decorators';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { AllConfigType } from '@/config/config.type';
import { AuthService } from '@/features/auth/core/auth.service';
import { WorkspaceService } from '@/features/workspace/service/workspace.service';
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
    private readonly workspaceService: WorkspaceService,
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

  // Browser entry point. Validates the request (so a bogus client or redirect_uri
  // fails here with a 400 instead of reaching the user), then hands off to the
  // web app's consent page, which handles sign-in and the consent UI.
  @Get('authorize')
  @ApiPublic({ summary: 'Start the MCP OAuth authorization flow (browser-facing)' })
  async authorize(
    @Query() query: Record<string, unknown>,
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    try {
      await this.mcpOauth.validateAuthorizeParams(query);
    } catch (err) {
      reply.status(HttpStatus.BAD_REQUEST).send({ error: 'invalid_request', error_description: (err as Error).message });
      return;
    }

    const frontendDomain = this.configService.getOrThrow('app.frontendDomain', { infer: true });
    const search = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    reply.redirect(`${frontendDomain}/oauth/authorize${search}`, HttpStatus.FOUND);
  }

  // What the consent page shows: who is asking and where they'll be sent back.
  // Re-validates the same params so the page never trusts the URL on its own.
  @Get('authorize/context')
  @ApiPublic({ summary: 'Describe an MCP OAuth authorization request for the consent page' })
  async authorizeContext(@Query() query: Record<string, unknown>, @Res() reply: FastifyReply): Promise<void> {
    try {
      const params = await this.mcpOauth.validateAuthorizeParams(query);
      const redirect = new URL(params.redirectUri);
      reply.send({
        clientName: params.clientName ?? null,
        redirectHost: redirect.host,
        redirectProtocol: redirect.protocol,
        scope: params.scope ?? null,
      });
    } catch (err) {
      reply.status(HttpStatus.BAD_REQUEST).send({ error: 'invalid_request', error_description: (err as Error).message });
    }
  }

  @Post('authorize/confirm')
  @ApiPublic({ summary: 'Confirm or deny the MCP OAuth consent screen' })
  async confirm(
    @Body() body: Record<string, unknown> & { decision: 'allow' | 'deny'; workspace_id?: string },
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

    // The workspace picked on the consent page becomes the user's default
    // (last visited), which MCP tools fall back to. switchWorkspace checks
    // membership; it returns false (no change) for a workspace they can't use.
    if (body.workspace_id) {
      try {
        await this.workspaceService.switchWorkspace(session.id, body.workspace_id);
      } catch {
        // An invalid id must not block authorization; the default just stays as it was.
      }
    }

    const code = await this.mcpOauth.issueCode(params, session.id);
    redirect.searchParams.set('code', code);
    if (params.state) redirect.searchParams.set('state', params.state);
    reply.send({ redirectTo: redirect.toString() });
  }

  @Post('token')
  @ApiPublic({ summary: 'Exchange an authorization code or a refresh token for an access token' })
  async token(
    @Body()
    body: {
      grant_type: string;
      code?: string;
      code_verifier?: string;
      redirect_uri?: string;
      client_id?: string;
      refresh_token?: string;
    },
    @Res() reply: FastifyReply,
  ): Promise<void> {
    if (body.grant_type !== 'authorization_code' && body.grant_type !== 'refresh_token') {
      reply.status(HttpStatus.BAD_REQUEST).send({ error: 'unsupported_grant_type' });
      return;
    }

    try {
      const tokens =
        body.grant_type === 'refresh_token'
          ? await this.mcpOauth.refresh(body.refresh_token)
          : await this.mcpOauth.exchangeCode({
              code: body.code ?? '',
              codeVerifier: body.code_verifier ?? '',
              redirectUri: body.redirect_uri ?? '',
              clientId: body.client_id ?? '',
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
}
