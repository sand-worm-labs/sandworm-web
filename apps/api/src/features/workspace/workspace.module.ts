import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import {
  WorkspaceEntity,
  UserWorkspaceEntity,
  UserEntity,
  DocumentEntity,
} from '@sandworm/postgresql-typeorm';
import { WorkspaceService } from './service/workspace.service';
import { WorkspaceResolver } from './workspace.resolver';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from '@/infrastructure/mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkspaceEntity,
      UserWorkspaceEntity,
      UserEntity,
      DocumentEntity,
    ]),
    JwtModule.register({}),
    ConfigModule,
    MailModule,
  ],
  providers: [WorkspaceService, WorkspaceResolver],
  exports: [WorkspaceService],
})
export class WorkspaceModule { }