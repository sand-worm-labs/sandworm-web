import { AuthModule } from '@/features/auth/core/auth.module'
import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { YjsDocumentService } from './yjs-document.service'
import {
  YjsDocumentEntity,
  YjsAppDocumentEntity,
  UserYjsAppDocumentEntity,
  DocumentEntity,
  YjsUpdateEntity,
  PubSubPayloadEntity,
  UserWorkspaceEntity,
} from '@sandworm/postgresql-typeorm'
import { MessageHandlerService } from "./services/message-handler.service";
import { SyncHandlerService } from "./services/sync-handler.service";
import { PersistorFactory } from './persistors/persistor.factory'
import { LockModule } from '@/infrastructure/lock/lock.module'
import { PubSubModule } from '@/infrastructure/pubsub/pubsub.module'
import { YjsGateway } from './yjs.gateway'
import { DocumentModule } from '@/features/document/document.module'
import { BlockExecutorModule } from '@/features/block-executor/block-executor.module'
import { DocumentExecutorService } from './executor/document-executor.service'
import { YjsDocumentController } from './yjs.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        YjsDocumentEntity,
        YjsAppDocumentEntity,
        UserYjsAppDocumentEntity,
        YjsUpdateEntity,
        DocumentEntity,
        PubSubPayloadEntity,
        UserWorkspaceEntity
      ]),
    forwardRef(() => DocumentModule),
    AuthModule,
    LockModule,
    PubSubModule,
    BlockExecutorModule
  ],
  controllers: [YjsDocumentController],
  providers: [
    YjsDocumentService,
    PersistorFactory,
    MessageHandlerService,
    SyncHandlerService,
    YjsGateway,
    DocumentExecutorService
  ],
  exports: [
    YjsDocumentService,
    PersistorFactory,
    YjsGateway
  ],
})
export class YjsModule { }