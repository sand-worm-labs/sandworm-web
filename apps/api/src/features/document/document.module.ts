import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentEntity, WorkspaceEntity, FavoriteEntity, YjsDocumentEntity, DocumentForkEntity } from '@sandworm/postgresql-typeorm';
import { DocumentResolver } from './document.resolver';
import { DocumentService } from './service/document.service';
import { DocumentTreeService } from './service/document-tree.service';
import { AuthGraphqlModule } from '../auth/graphql/auth-graphql.module';
import { YjsModule } from '../collaboration/yjs/yjs.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DocumentEntity, DocumentForkEntity, WorkspaceEntity, FavoriteEntity, YjsDocumentEntity]),
    AuthGraphqlModule,
    forwardRef(() => YjsModule),
    UserModule
  ],
  providers: [DocumentResolver, DocumentService, DocumentTreeService],
  exports: [DocumentService, DocumentTreeService]
})
export class DocumentModule { }
