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
} from '@sandworm/postgresql-typeorm'
import { PersistorFactory } from './persistors/persistor.factory'
import { LockModule } from '@/infrastructure/lock/lock.module'

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        YjsDocumentEntity,
        YjsAppDocumentEntity,
        UserYjsAppDocumentEntity,
        YjsUpdateEntity,
        DocumentEntity
      ]),
    AuthModule,
    LockModule
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