import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
// import { YjsGateway } from './gateways/yjs.gateway'
// import { YjsDocumentService } from './services/yjs-document.service'
// import { YjsPersistenceService } from './services/yjs-persistence.service'
// import { YjsDocumentEntity } from './services/yjs-persistence.service'
import { AuthModule } from '../auth/auth.module' // Your auth module

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
export class YjsModule {}