import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspaceEntity, UserEntity, DocumentEntity } from '@sandworm/postgresql-typeorm';
import { AuthGraphqlModule } from '../auth-graphql/auth-graphql.module';
import { WorkspaceResolver } from './workspace.resolver';
import { WorkspaceService } from './workspace.service';
@Module({
  imports: [TypeOrmModule.forFeature([UserEntity,WorkspaceEntity, DocumentEntity ]), AuthGraphqlModule],
  providers: [WorkspaceResolver, WorkspaceService],
})
export class WorkspaceModule { }
