import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import aiServiceConfig from './config/ai-service.config';
import { TitleGeneratorService } from './services/title-generator.service';
import { MarkdownGeneratorService } from './services/markdown-generator.service';
import { PythonGeneratorService } from './services/python-generator.service';
import { SqlGeneratorService } from './services/sql-generator.service';
import { ChatComposerService } from './services/chat-composer.service';
import { CellEditClient } from './services/cell-edit.client';
import { AuthModule } from '@/features/auth/core/auth.module';
import { WorkspaceModule } from '@/features/workspace/workspace.module';

const GENERATOR_SERVICES = [
  TitleGeneratorService,
  MarkdownGeneratorService,
  PythonGeneratorService,
  SqlGeneratorService,
  ChatComposerService,
  CellEditClient,
];

@Module({
  imports: [
    ConfigModule.forFeature(aiServiceConfig),
    HttpModule,
    WorkspaceModule,
    AuthModule,
  ],
  providers: [...GENERATOR_SERVICES],
  exports: [...GENERATOR_SERVICES],
})
export class AiModule {}