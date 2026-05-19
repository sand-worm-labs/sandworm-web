import { Injectable, Logger } from '@nestjs/common'
import { BaseAiExecutorService} from './base-ai-executor.service'
import { YjsDocumentService } from '@/features/collaboration/yjs/yjs-document.service';
import { PersistorFactory } from '@/features/collaboration/yjs/persistors/persistor.factory';

@Injectable()
export class PivotAiExecutorService extends BaseAiExecutorService {
  protected readonly logger = new Logger(PivotAiExecutorService.name)

  constructor(
    yjsDocumentService: YjsDocumentService,
    persistorFactory: PersistorFactory,  
  ) {
    super(yjsDocumentService, persistorFactory);
  }

}