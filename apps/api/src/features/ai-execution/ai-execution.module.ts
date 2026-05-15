import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SqlAiExecutorService } from './service/sql-ai-executor.service';
import { PythonAiExecutorService } from './service/python-ai-executor.service';
import { VisualizationAiExecutorService } from './service/visualization-ai-executor.service';
import { TextAiExecutorService } from './service/text-ai-executor.service';
import { ToolsAiExecutorService } from './service/tools-ai-executor.service';
import { TitleAiExecutorService } from './service/title-ai-executor.service';
import { YjsModule } from '../collaboration/yjs/yjs.module';
 
 
const EXECUTORS = [
  TitleAiExecutorService
]
 
@Module({
  imports: [ConfigModule,YjsModule],
  providers: [...EXECUTORS],
  exports: [...EXECUTORS],
})
export class AiExecutionModule {}
 
