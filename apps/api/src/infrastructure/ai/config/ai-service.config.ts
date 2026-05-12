import { registerAs } from '@nestjs/config';
import { IsString, IsUrl } from 'class-validator';
import validateConfig from '@/common/utils/validate-config';
import { AiServiceConfig } from './ai-service-config.type';

class EnvironmentVariablesValidator {
  @IsUrl({ require_tld: false })
  @IsString()
  AI_SERVICE_URL: string;

  @IsString()
  AI_HANDSHAKE_TOKEN: string;
}

export default registerAs<AiServiceConfig>('ai', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    url: process.env.AI_SERVICE_URL ?? 'http://localhost:8000',
    handshakeToken: process.env.AI_HANDSHAKE_TOKEN,
  };
});
