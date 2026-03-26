import { registerAs } from '@nestjs/config';
import { IsNumber, IsString, Min } from 'class-validator';
import validateConfig from '@/common/utils/validate-config';
import { OpenRouterConfig } from './openrouter-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  OPENROUTER_PROVISIONING_KEY: string;

  @IsNumber()
  @Min(0)
  OPENROUTER_DEFAULT_CAP: number;

  @IsString()
  OPENROUTER_LIMIT_RESET: string;
}

export default registerAs<OpenRouterConfig>('openrouter', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    provisioningKey: process.env.OPENROUTER_PROVISIONING_KEY,
    defaultCap: process.env.OPENROUTER_DEFAULT_CAP
      ? parseFloat(process.env.OPENROUTER_DEFAULT_CAP)
      : 10.0,
    limitReset: process.env.OPENROUTER_LIMIT_RESET ?? 'monthly',
  };
});
