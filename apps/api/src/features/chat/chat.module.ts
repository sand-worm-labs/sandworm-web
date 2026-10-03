import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatEntity, DocumentEntity, MessageEntity, WorkspaceEntity, VoteEntity, UserWorkspaceEntity } from '@sandworm/postgresql-typeorm';
import { AuthGraphqlModule } from '@/features/auth/graphql/auth-graphql.module';
import { ChatResolver } from './resolver/chat.resolver';
import { MessageResolver } from "./resolver/message.resolver";
import { ChatService } from './chat.service';
import { McpChatLogService } from './mcp-chat-log.service';
import { ConfigModule } from '@nestjs/config';
import aiServiceConfig from '@/infrastructure/ai/config/ai-service.config';
import { HttpModule } from '@nestjs/axios';
import { WorkspaceModule } from '../workspace/workspace.module';
import { AiExecutionModule } from '../ai-execution/ai-execution.module';
import { ChatController } from './chat.controller';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    ConfigModule.forFeature(aiServiceConfig),
    TypeOrmModule.forFeature([ChatEntity, MessageEntity, WorkspaceEntity, DocumentEntity, VoteEntity, UserWorkspaceEntity]),
    HttpModule,
    AuthGraphqlModule,
    WorkspaceModule,
    EventEmitterModule,
    forwardRef(() => AiExecutionModule)
    
  ],
  controllers: [ChatController],
  providers: [ChatResolver,MessageResolver,ChatService,McpChatLogService],
  exports: [ChatService],
})
export class ChatModule {}
