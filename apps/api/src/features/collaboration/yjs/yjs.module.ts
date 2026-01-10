import { AuthModule } from '@/features/auth/core/auth.module'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
// import { YjsGateway } from './gateways/yjs.gateway'
// import { YjsDocumentService } from './services/yjs-document.service'
// import { YjsPersistenceService } from './services/yjs-persistence.service'
// import { YjsDocumentEntity } from './services/yjs-persistence.service'

@Module({
  imports: [
    // TypeOrmModule.forFeature([YjsDocumentEntity]),
    AuthModule,
  ],
  providers: [
    // YjsGateway,
    // YjsDocumentService,
    // YjsPersistenceService,
  ],
  exports: [
    // YjsDocumentService, YjsPersistenceService
  ],
})
export class YjsModule { }