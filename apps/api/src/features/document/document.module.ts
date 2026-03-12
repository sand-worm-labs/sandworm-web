import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentEntity, WorkspaceEntity, FavoriteEntity, YjsDocumentEntity } from '@sandworm/postgresql-typeorm';
import { DocumentResolver } from './document.resolver';
import { DocumentService } from './service/document.service';
import { DocumentTreeService } from './service/document-tree.service';
import { AuthGraphqlModule } from '../auth/graphql/auth-graphql.module';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentEntity, WorkspaceEntity, FavoriteEntity, YjsDocumentEntity]), AuthGraphqlModule],
  providers: [DocumentResolver, DocumentService, DocumentTreeService],
  exports: [DocumentService, DocumentTreeService]
})
export class DocumentModule { }
