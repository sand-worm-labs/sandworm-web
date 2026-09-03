import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentEntity, WorkspaceEntity, FavoriteEntity, YjsDocumentEntity, DocumentForkEntity, UserEntity } from '@sandworm/postgresql-typeorm';
import { DocumentResolver } from './document.resolver';
import { DocumentService } from './service/document.service';
import { DocumentTreeService } from './service/document-tree.service';
import { AuthGraphqlModule } from '../auth/graphql/auth-graphql.module';
import { YjsModule } from '../collaboration/yjs/yjs.module';
import { UserModule } from '../user/user.module';
import { WorkspaceModule } from '../workspace/workspace.module';
import { DocumentQueryController } from './document.controller';
import { JupyterModule } from '@/infrastructure/jupyter/jupyter.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DocumentEntity, DocumentForkEntity, WorkspaceEntity, FavoriteEntity,UserEntity, YjsDocumentEntity]),
    AuthGraphqlModule,
    forwardRef(() => YjsModule),
    forwardRef(() => UserModule),
    forwardRef(() => WorkspaceModule),
    JupyterModule
  ],
  providers: [DocumentResolver, DocumentService, DocumentTreeService],
  controllers: [DocumentQueryController],
  exports: [DocumentService, DocumentTreeService]
})
export class DocumentModule { }
