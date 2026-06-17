import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from "@nestjs/axios";
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SqlAiExecutorService } from './service/sql-ai-executor.service';
import { TitleAiExecutorService } from './service/title-ai-executor.service';
import { AiBlockEventService } from './service/ai-block-event.service';
import { TitleAiExecutorResolver } from './resolver/title-ai-executor.resolver';
import { YjsModule } from '../collaboration/yjs/yjs.module';
import { SqlAiExecutorResolver } from './resolver/sql-ai-executor.resolver';
import { PythonAiExecutorService } from './service/python-ai-executor.service';
import { PythonAiExecutorResolver } from './resolver/python-ai-executor.resolver';
import { ChatModule } from '../chat/chat.module';
import { TextAiExecutorResolver } from './resolver/text-ai-executor.resolver';
import { TextAiExecutorService } from './service/text-ai-executor.service';
import { AiModule } from '@/infrastructure/ai/ai.module';
import { WorkspaceModule } from '@/features/workspace/workspace.module';


const EXECUTORS = [
  TitleAiExecutorService,
  SqlAiExecutorService,
  PythonAiExecutorService,
  TextAiExecutorService,
  AiBlockEventService,
]

const RESOLVERS = [
  TitleAiExecutorResolver,
  SqlAiExecutorResolver,
  PythonAiExecutorResolver,
  TextAiExecutorResolver,
]
 
@Module({
  imports: [
    ConfigModule,
    HttpModule,
    YjsModule,
    AiModule,
    WorkspaceModule,
    EventEmitterModule,
    forwardRef(() => ChatModule)
  ],
  providers: [...EXECUTORS, ...RESOLVERS],
  exports: [...EXECUTORS],
})
export class AiExecutionModule {}
 
