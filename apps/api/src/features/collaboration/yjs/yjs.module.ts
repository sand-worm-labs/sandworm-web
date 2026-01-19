import { AuthModule } from '@/features/auth/core/auth.module'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { YjsDocumentService } from './yjs-document.service'
import {
  YjsDocumentEntity,
  YjsAppDocumentEntity,
  UserYjsAppDocumentEntity,
  DocumentEntity,
} from '@sandworm/postgresql-typeorm'
import { PersistorFactory } from './persistors/persistor.factory'

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        YjsDocumentEntity,
        YjsAppDocumentEntity,
        UserYjsAppDocumentEntity,
        DocumentEntity
      ]),
    AuthModule,
  ],
  providers: [
    YjsDocumentService
  ],
  exports: [
    YjsDocumentService,
    PersistorFactory
  ],
})
export class YjsModule { }