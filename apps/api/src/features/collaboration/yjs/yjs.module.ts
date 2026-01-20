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
import { PersistorFactory } from './persistors/persistor.factory'
import { LockModule } from '@/infrastructure/lock/lock.module'
import { PubSubModule } from '@/infrastructure/pubsub/pubsub.module'

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
    PubSubModule
  ],
  providers: [
    YjsDocumentService,
    PersistorFactory
  ],
  exports: [
    YjsDocumentService,
    PersistorFactory
  ],
})
export class YjsModule { }