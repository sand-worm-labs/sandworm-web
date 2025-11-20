import { registerAs } from '@nestjs/config';
import { validateConfig } from '@sandworm/nest-common';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { JupyterConfig } from './juypter-config.type';

class JupyterEnvironmentValidator {
  @ValidateIf((envValues) => envValues.DEPLOY_MODE)
  @IsString()
  DEPLOY_MODE: string; 

  @ValidateIf((envValues) => envValues.JUPYTER_PROTOCOL)
  @IsString()
  JUPYTER_PROTOCOL: string;

  @ValidateIf((envValues) => envValues.JUPYTER_HOST)
  @IsString()
  JUPYTER_HOST: string;

  @ValidateIf((envValues) => envValues.JUPYTER_PORT)
  @IsInt()
  @Min(0)
  @Max(65535)
  JUPYTER_PORT: number;

  @ValidateIf((envValues) => envValues.JUPYTER_TOKEN)
  @IsString()
  @IsOptional()
  JUPYTER_TOKEN: string;
}

export default registerAs<JupyterConfig>('jupyter', () => {
  console.info('Register JupyterConfig from environment variables');

  validateConfig(process.env, JupyterEnvironmentValidator);

  return {
    deployMode: (process.env.DEPLOY_MODE as 'compose') ?? 'compose',
    protocol: process.env.JUPYTER_PROTOCOL,
    host: process.env.JUPYTER_HOST,
    port: process.env.JUPYTER_PORT
      ? parseInt(process.env.JUPYTER_PORT, 10)
      : null,
    token: process.env.JUPYTER_TOKEN,
  };
});