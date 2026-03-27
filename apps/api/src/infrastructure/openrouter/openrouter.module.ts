import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspaceEntity } from '@sandworm/postgresql-typeorm';
import { OpenRouterService } from './openrouter.service';
import { OpenRouterResolver } from './openrouter.resolver';
import { WorkspaceModule } from '@/features/workspace/workspace.module';
import { EnvironmentModule } from '@/features/environment/environment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity]),
    EnvironmentModule,
    forwardRef(() => WorkspaceModule),
  ],
  providers: [OpenRouterService, OpenRouterResolver],
  exports: [OpenRouterService],
})
export class OpenRouterModule {}