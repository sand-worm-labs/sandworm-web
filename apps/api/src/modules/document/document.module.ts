import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentEntity, WorkspaceEntity, FavoriteEntity } from '@sandworm/postgresql-typeorm';
import { AuthGraphqlModule } from '../auth-graphql/auth-graphql.module';
import { DocumentResolver } from './document.resolver';
import { DocumentService } from './document.service';
@Module({
  imports: [TypeOrmModule.forFeature([DocumentEntity, WorkspaceEntity, FavoriteEntity]), AuthGraphqlModule],
  providers: [DocumentResolver, DocumentService],
})
export class DocumentModule { }
