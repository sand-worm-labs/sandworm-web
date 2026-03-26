import { Module } from '@nestjs/common';
import { OpenRouterService } from './openrouter.service';
import { OpenRouterResolver } from './openrouter.resolver';

@Module({
  providers: [OpenRouterService, OpenRouterResolver],
  exports: [OpenRouterService],
})
export class OpenRouterModule {}