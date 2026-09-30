import { Controller, Get } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ApiPublic } from '@sandworm/api/decorators/http.decorators';
import { AllConfigType } from '@/config/config.type';

// RFC 8414 requires this at a fixed, unprefixed path so clients can find it
// without prior configuration — main.ts excludes '.well-known/(.*)' from the
// global 'api' prefix specifically for this controller.
@ApiExcludeController()
@Controller('.well-known')
export class McpOauthMetadataController {
  constructor(private readonly configService: ConfigService<AllConfigType>) {}

  @Get('oauth-authorization-server')
  @ApiPublic({ summary: 'OAuth 2.0 Authorization Server Metadata (RFC 8414)' })
  authorizationServerMetadata() {
    const appUrl = this.configService.getOrThrow('app.url', { infer: true });
    const issuer = appUrl;

    return {
      issuer,
      authorization_endpoint: `${appUrl}/api/oauth/authorize`,
      token_endpoint: `${appUrl}/api/oauth/token`,
      registration_endpoint: `${appUrl}/api/oauth/register`,
      response_types_supported: ['code'],
      grant_types_supported: ['authorization_code'],
      code_challenge_methods_supported: ['S256'],
      token_endpoint_auth_methods_supported: ['none'],
    };
  }
}
