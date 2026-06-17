import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BlockActionEvent, BlockActionEventNames } from '@/core/events/block-action.events';

@Injectable()
export class AiBlockEventService implements OnModuleInit {
  private readonly logger = new Logger(AiBlockEventService.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  onModuleInit(): void {
    this.eventEmitter.on(BlockActionEventNames.BLOCK_ACTION, (event: BlockActionEvent) => {
      this.logger.log(`[block-action] action=${event.action} type=${event.blockType} title="${event.blockTitle}"`);
    });
  }
}
