import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SqlAiExecutorService } from './sql-ai-executor.service';
import { PythonAiExecutorService } from './python-ai-executor.service';
import { VisualizationAiExecutorService } from './visualization-ai-executor.service';
import { TextAiExecutorService } from './text-ai-executor.service';
import { ToolsAiExecutorService } from './tools-ai-executor.service';
 
 
const EXECUTORS = [
  SqlAiExecutorService,
  PythonAiExecutorService,
  VisualizationAiExecutorService,
  TextAiExecutorService,
  ToolsAiExecutorService,
]
 
@Module({
  imports: [ConfigModule],
  providers: [...EXECUTORS],
  exports: [...EXECUTORS],
})
export class AiExecutionModule {}
 
