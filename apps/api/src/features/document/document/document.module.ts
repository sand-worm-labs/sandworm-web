import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentEntity, WorkspaceEntity, FavoriteEntity, YjsDocumentEntity } from '@sandworm/postgresql-typeorm';
import { AuthGraphqlModule } from '../auth-graphql/auth-graphql.module';
import { DocumentResolver } from './document.resolver';
import { DocumentService } from './service/document.service';
@Module({
  imports: [TypeOrmModule.forFeature([DocumentEntity, WorkspaceEntity, FavoriteEntity, YjsDocumentEntity]), AuthGraphqlModule],
  providers: [DocumentResolver, DocumentService],
})
export class DocumentModule { }
