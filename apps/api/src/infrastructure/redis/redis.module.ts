import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatModule } from '@/features/chat/chat.module';
import redisConfig from './redis.config';
import { RedisService } from './redis.service';
import { AiJobListenerService } from './ai-job-listener.service';
import { McpJobWorkerService } from './mcp-job-worker.service';

@Global()
@Module({
  imports: [ConfigModule.forFeature(redisConfig), ChatModule],
  providers: [RedisService, AiJobListenerService, McpJobWorkerService],
  exports: [RedisService],
})
export class RedisModule {}
