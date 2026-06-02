import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatEntity, DocumentEntity, MessageEntity, WorkspaceEntity, VoteEntity } from '@sandworm/postgresql-typeorm';
import { AuthGraphqlModule } from '@/features/auth/graphql/auth-graphql.module';
import { ChatResolver } from './resolver/chat.resolver';
import { MessageResolver } from "./resolver/message.resolver";
import { ChatService } from './chat.service';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import aiServiceConfig from '@/infrastructure/ai/config/ai-service.config';
import { HttpModule } from '@nestjs/axios';
import { WorkspaceModule } from '../workspace/workspace.module';
import { AiExecutionModule } from '../ai-execution/ai-execution.module';
import { AiModule } from '@/infrastructure/ai/ai.module';
import { ChatController } from './chat.controller';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forFeature(aiServiceConfig),
    TypeOrmModule.forFeature([ChatEntity, MessageEntity, WorkspaceEntity, DocumentEntity, VoteEntity]),
    HttpModule,
    AuthGraphqlModule,
    WorkspaceModule,
    AiModule,
    forwardRef(() => AiExecutionModule),
  ],
  controllers: [ChatController],
  providers: [ChatResolver,MessageResolver,ChatService],
  exports: [ChatService],
})
export class ChatModule {}
