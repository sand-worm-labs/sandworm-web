import validateConfig from '@/common/utils/validate-config';
import { registerAs } from '@nestjs/config';
import { IsOptional, IsString } from 'class-validator';
import { DynamicConfig } from './dynamic-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  @IsOptional()
  DYNAMIC_PUBLIC_KEY: string;
}

export default registerAs<DynamicConfig>('dynamic', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    // The PEM from the Dynamic dashboard (Developer, API); a one-line value may write its line breaks as \n
    publicKey: process.env.DYNAMIC_PUBLIC_KEY?.replace(/\\n/g, '\n'),
  };
});
