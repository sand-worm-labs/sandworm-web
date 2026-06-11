import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import redisConfig from './redis.config';
import { RedisService } from './redis.service';
import { RedisJobListenerService } from './redis-job-listener.service';

@Global()
@Module({
  imports: [ConfigModule.forFeature(redisConfig)],
  providers: [RedisService, RedisJobListenerService],
  exports: [RedisService, RedisJobListenerService],
})
export class RedisModule {}
