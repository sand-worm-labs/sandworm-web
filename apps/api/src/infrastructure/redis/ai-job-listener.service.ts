import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class AiJobListenerService implements OnModuleInit {
  private readonly logger = new Logger(AiJobListenerService.name);

  constructor(private readonly redisService: RedisService) {}

  onModuleInit(): void {
    this.logger.log('Listening for AI job events on ai:job:*');
    this.redisService.psubscribe('ai:job:*', (channel, message) => {
      this.logger.log(`[${channel}] ${message}`);
    });
  }
}
