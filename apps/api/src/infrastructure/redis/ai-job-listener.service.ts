import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { validate as isUuid } from 'uuid';
import { ChatService } from '@/features/chat/chat.service';
import { RedisService } from './redis.service';

@Injectable()
export class AiJobListenerService implements OnModuleInit {
  private readonly logger = new Logger(AiJobListenerService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly chatService: ChatService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.logger.log('Listening for AI job events on ai:job:*');
    await this.redisService.catchUpAndSubscribe(async (channel, message) => {
      const event = JSON.parse(message);
      const jobId = channel.split(':')[2];

      if (!event.chat_id || !isUuid(event.chat_id)) {
        this.logger.warn(`Invalid or missing chat_id on job ${jobId}, deleting events`);
        await this.redisService.del(`ai:job:${jobId}:events`);
        return;
      }

      const exists = await this.chatService.chatExists(event.chat_id);
      if (!exists) {
        this.logger.warn(`chat_id ${event.chat_id} not found, deleting job ${jobId} events`);
        await this.redisService.del(`ai:job:${jobId}:events`);
        return;
      }

      await this.chatService.createOrAppendMessageByJobId(event.chat_id, jobId, event);
      this.logger.log(`[${channel}] chat=${event.chat_id} type=${event.type}`);
    });
  }
}
