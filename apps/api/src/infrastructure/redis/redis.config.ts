import { registerAs } from '@nestjs/config';
import { IsOptional, IsString } from 'class-validator';
import validateConfig from '@/common/utils/validate-config';

export type RedisConfig = {
  url: string;
};

class RedisEnvValidator {
  @IsString()
  @IsOptional()
  REDIS_URL: string;
}

export default registerAs<RedisConfig>('redis', () => {
  validateConfig(process.env, RedisEnvValidator);
  return {
    url: process.env.REDIS_URL ?? 'redis://localhost:6379',
  };
});
