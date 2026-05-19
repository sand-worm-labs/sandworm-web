import { Injectable, Logger } from '@nestjs/common'
import { BaseAiExecutorService} from './base-ai-executor.service'

@Injectable()
export class ToolsAiExecutorService extends BaseAiExecutorService {
  protected readonly logger = new Logger(ToolsAiExecutorService.name)
}
