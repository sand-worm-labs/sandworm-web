import { Injectable, Logger } from '@nestjs/common'
import { BaseAiExecutorService} from './base-ai-executor.service'

@Injectable()
export class PivotAiExecutorService extends BaseAiExecutorService {
  protected readonly logger = new Logger(PivotAiExecutorService.name)
}