import { Injectable, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { RedisService } from './redis.service';

export type JobEvent =
  | { type: 'started'; chat_id?: string }
  | { type: 'fetching_notebook_context'; chat_id?: string }
  | { type: 'context_fetched'; chat_id?: string }
  | { type: 'planning'; chat_id?: string }
  | { type: 'plan_ready'; blocks: { type: string; title: string; description: string }[]; chat_id?: string }
  | { type: 'generating_block'; index: number; total: number; block_type: string; title: string; chat_id?: string }
  | { type: 'block_ready'; index: number; total: number; block: Record<string, unknown>; chat_id?: string }
  | { type: 'generating_response'; chat_id?: string }
  | { type: 'completed'; output: string; chat_id?: string }
  | { type: 'error'; detail: string; chat_id?: string };

@Injectable()
export class RedisJobListenerService {
  private readonly logger = new Logger(RedisJobListenerService.name);

  constructor(private readonly redisService: RedisService) {}

  listen(jobId: string): Observable<JobEvent> {
    return new Observable<JobEvent>((subscriber) => {
      const channel = `job:${jobId}`;
      const sub = this.redisService.createSubscriber();

      sub.subscribe(channel, (err) => {
        if (err) {
          this.logger.error(`Failed to subscribe to ${channel}`, err);
          subscriber.error(err);
        }
      });

      sub.on('message', (ch: string, message: string) => {
        if (ch !== channel) return;
        try {
          const event = JSON.parse(message) as JobEvent;
          subscriber.next(event);
          if (event.type === 'completed' || event.type === 'error') {
            subscriber.complete();
          }
        } catch (err) {
          this.logger.error(`Failed to parse job event on ${channel}: ${message}`, err);
        }
      });

      sub.on('error', (err) => {
        this.logger.error(`Subscriber error on ${channel}`, err);
        subscriber.error(err);
      });

      return () => {
        sub.unsubscribe(channel)
          .then(() => sub.quit())
          .catch((err) => this.logger.error(`Failed to clean up subscriber for ${channel}`, err));
      };
    });
  }
}
