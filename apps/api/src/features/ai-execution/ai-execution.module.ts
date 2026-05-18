import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SqlAiExecutorService } from './service/sql-ai-executor.service';
import { TitleAiExecutorService } from './service/title-ai-executor.service';
import { TitleAiExecutorResolver } from './resolver/title-ai-executor.resolver';
import { YjsModule } from '../collaboration/yjs/yjs.module';
import { SqlAiExecutorResolver } from './resolver/sql-ai-executor.resolver';
import { PythonAiExecutorService } from './service/python-ai-executor.service';
import { PythonAiExecutorResolver } from './resolver/python-ai-executor.resolver';
import { ChatModule } from '../chat/chat.module';
 
 
const EXECUTORS = [
  TitleAiExecutorService,
  SqlAiExecutorService,
  PythonAiExecutorService
]

const RESOLVERS = [
  TitleAiExecutorResolver,
  SqlAiExecutorResolver,
  PythonAiExecutorResolver,
]
 
@Module({
  imports: [
    ConfigModule,
    YjsModule, 
    forwardRef(() => ChatModule)
  ],
  providers: [...EXECUTORS, ...RESOLVERS],
  exports: [...EXECUTORS],
})
export class AiExecutionModule {}
 
