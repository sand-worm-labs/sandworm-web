import { registerAs } from '@nestjs/config';
import { IsBooleanString, IsNumberString, IsOptional, IsString, IsUrl } from 'class-validator';
import validateConfig from '@/common/utils/validate-config';
import { AiServiceConfig } from './ai-service-config.type';

class EnvironmentVariablesValidator {
  @IsUrl({ require_tld: false })
  @IsString()
  AI_SERVICE_URL: string;

  @IsString()
  AI_HANDSHAKE_TOKEN: string;

  @IsOptional()
  @IsBooleanString()
  AI_CHAT_STREAM: string;

  @IsOptional()
  @IsNumberString()
  AI_CHAT_TEMPERATURE: string;

  @IsOptional()
  @IsNumberString()
  AI_CHAT_MAX_TOKENS: string;
}

export default registerAs<AiServiceConfig>('ai', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    url: process.env.AI_SERVICE_URL ?? 'http://localhost:8000',
    handshakeToken: process.env.AI_HANDSHAKE_TOKEN,
    chatStream: process.env.AI_CHAT_STREAM === 'true',
    chatTemperature: Number(process.env.AI_CHAT_TEMPERATURE ?? 0.7),
    chatMaxTokens: Number(process.env.AI_CHAT_MAX_TOKENS ?? 20000),
  };
});
