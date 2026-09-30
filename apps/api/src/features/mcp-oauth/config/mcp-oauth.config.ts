import { registerAs } from '@nestjs/config';
import { IsString } from 'class-validator';
import validateConfig from '@/common/utils/validate-config';
import { McpOauthConfig } from './mcp-oauth-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  MCP_OAUTH_RESOURCE: string;

  @IsString()
  MCP_OAUTH_INTROSPECT_KEY: string;
}

export default registerAs<McpOauthConfig>('mcpOauth', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    resource: process.env.MCP_OAUTH_RESOURCE as string,
    introspectKey: process.env.MCP_OAUTH_INTROSPECT_KEY as string,
  };
});
