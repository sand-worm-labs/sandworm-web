import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import aiServiceConfig from './config/ai-service.config';
import { TitleGeneratorService } from './services/title-generator.service';
import { WorkspaceModule } from '@/features/workspace/workspace.module';

@Module({
  imports: [
    ConfigModule.forFeature(aiServiceConfig),
    HttpModule,
    WorkspaceModule
  ],
  providers: [TitleGeneratorService],
  exports: [TitleGeneratorService],
})
export class AiModule {}