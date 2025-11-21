import { registerAs } from '@nestjs/config';
import { validateConfig } from '@sandworm/nest-common';
import {
  IsString,
  IsInt,
  IsOptional,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';
import { RedisConfig } from './redis-config.type';

class RedisEnvironmentValidator {
  @ValidateIf(env => env.REDIS_URL)
  @IsString()
  REDIS_URL: string;

  @ValidateIf(env => !env.REDIS_URL)
  @IsString()
  REDIS_HOST: string;

  @ValidateIf(env => !env.REDIS_URL)
  @IsInt()
  @Min(0)
  @Max(65535)
  REDIS_PORT: number;

  @IsString()
  @IsOptional()
  REDIS_USERNAME?: string;

  @IsString()
  @IsOptional()
  REDIS_PASSWORD?: string;

  @IsOptional()
  @IsInt()
  REDIS_DB?: number;
}

export default registerAs<RedisConfig>('redis', () => {
  console.info('Register RedisConfig from environment variables');

  validateConfig(process.env, RedisEnvironmentValidator);

  if (process.env.REDIS_URL) {
    return {
      mode:"standalone",
      url: process.env.REDIS_URL,
      host: null,
      port: null,
      username: null,
      password: null,
      db: null,
    };
  }

  return {
    mode:"standalone",
    url: null,
    host: process.env.REDIS_HOST ?? 'localhost',
    port: process.env.REDIS_PORT
      ? parseInt(process.env.REDIS_PORT, 10)
      : 6379,
    username: process.env.REDIS_USERNAME ?? null,
    password: process.env.REDIS_PASSWORD ?? null,
    db: process.env.REDIS_DB
      ? parseInt(process.env.REDIS_DB, 10)
      : 0,
  };
});
