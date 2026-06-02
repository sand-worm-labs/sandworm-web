import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import aiServiceConfig from './config/ai-service.config';
import { TitleGeneratorService } from './services/title-generator.service';
import { MarkdownGeneratorService } from './services/markdown-generator.service';
import { PythonGeneratorService } from './services/python-generator.service';
import { SqlGeneratorService } from './services/sql-generator.service';
import { ChatComposerService } from './services/chat-composer.service';
import { WorkspaceModule } from '@/features/workspace/workspace.module';

const GENERATOR_SERVICES = [
  TitleGeneratorService,
  MarkdownGeneratorService,
  PythonGeneratorService,
  SqlGeneratorService,
  ChatComposerService,
];

@Module({
  imports: [
    ConfigModule.forFeature(aiServiceConfig),
    HttpModule,
    WorkspaceModule,
    
  ],
  providers: [...GENERATOR_SERVICES],
  exports: [...GENERATOR_SERVICES],
})
export class AiModule {}