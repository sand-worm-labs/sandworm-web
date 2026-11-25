import validateConfig from '@/common/utils/validate-config';
import { registerAs } from '@nestjs/config';
import { IsOptional, IsString } from 'class-validator';
import { DynamicConfig } from './dynamic-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  @IsOptional()
  DYNAMIC_PUBLIC_KEY: string;

  @IsString()
  @IsOptional()
  DYNAMIC_ENVIRONMENT_ID: string;
}

export default registerAs<DynamicConfig>('dynamic', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    // Optional, to pin one key: the PEM from the Dynamic dashboard (Developer, API); a one-line value may write its line breaks as \n
    publicKey: process.env.DYNAMIC_PUBLIC_KEY?.replace(/\\n/g, '\n'),
    // The environment's id (the front ends' NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID): its published keys check the tokens, rotation included
    environmentId: process.env.DYNAMIC_ENVIRONMENT_ID,
  };
});
