import { AuthModule } from '@/features/auth/core/auth.module'
import { Module } from '@nestjs/common'
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
    AuthModule,
    LockModule,
    PubSubModule,
    DocumentModule
  ],
  providers: [
    YjsDocumentService,
    PersistorFactory,
    MessageHandlerService,
    SyncHandlerService,
    YjsGateway
  ],
  exports: [
    YjsDocumentService,
    PersistorFactory,
    YjsGateway
  ],
})
export class YjsModule { }