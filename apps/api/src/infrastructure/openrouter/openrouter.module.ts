import { forwardRef, Module } from '@nestjs/common';
import { OpenRouterService } from './openrouter.service';
import { OpenRouterResolver } from './openrouter.resolver';
import { WorkspaceModule } from '@/features/workspace/workspace.module';

@Module({
  imports: [
    forwardRef(() => WorkspaceModule),
  ],
  providers: [OpenRouterService, OpenRouterResolver],
  exports: [OpenRouterService],
})
export class OpenRouterModule {}