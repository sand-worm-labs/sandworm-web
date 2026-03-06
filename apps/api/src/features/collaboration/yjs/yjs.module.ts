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
} from '@sandworm/postgresql-typeorm'
import { PersistenceService } from "./services/persistence.service";
import { SessionManagerService } from "./services/session-manager.service";
import { MessageHandlerService } from "./services/message-handler.service";
import { SyncHandlerService } from "./services/sync-handler.service";
import { PersistorFactory } from './persistors/persistor.factory'
import { LockModule } from '@/infrastructure/lock/lock.module'
import { PubSubModule } from '@/infrastructure/pubsub/pubsub.module'
import { YjsGateway } from './yjs.gateway'

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        YjsDocumentEntity,
        YjsAppDocumentEntity,
        UserYjsAppDocumentEntity,
        YjsUpdateEntity,
        DocumentEntity,
        PubSubPayloadEntity
      ]),
    AuthModule,
    LockModule,
    PubSubModule,
  ],
  providers: [
    YjsDocumentService,
    PersistorFactory,
    PersistenceService,
    SessionManagerService,
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