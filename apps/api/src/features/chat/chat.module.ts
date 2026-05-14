import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatEntity, DocumentEntity, MessageEntity, WorkspaceEntity } from '@sandworm/postgresql-typeorm';
import { AuthGraphqlModule } from '@/features/auth/graphql/auth-graphql.module';
import { ChatResolver } from './chat.resolver';
import { ChatService } from './chat.service';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import aiServiceConfig from '@/infrastructure/ai/config/ai-service.config';
import { HttpModule } from '@nestjs/axios';
import { WorkspaceModule } from '../workspace/workspace.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forFeature(aiServiceConfig),
    TypeOrmModule.forFeature([ChatEntity, MessageEntity, WorkspaceEntity, DocumentEntity]),
    HttpModule,
    AuthGraphqlModule,
    WorkspaceModule
  ],
  providers: [ChatResolver, ChatService],
  exports: [ChatService],
})
export class ChatModule {}
