import { Injectable, Logger } from '@nestjs/common';
import * as Y from 'yjs';
import {
    ExecutionQueueItem,
    DateInputBlock,
    getDateInputAttributes,
} from '@sandworm/editor';
import { DocumentContext } from '../../interfaces';
import { VARIABLE_NAME_REGEX } from '@/features/code-execution/utils';
import { VariableService } from '@/features/code-execution/variable.service';

@Injectable()
export class DateInputBlockExecutorService {
    private readonly logger = new Logger(DateInputBlockExecutorService.name);

    constructor(private readonly variableService: VariableService) { }

    async save(
        executionItem: ExecutionQueueItem,
        block: Y.XmlElement<DateInputBlock>,
        ctx: DocumentContext,
    ): Promise<void> {
        const { id: blockId, variable, value, dateType } = getDateInputAttributes(block, ctx.blocks);

        if (!VARIABLE_NAME_REGEX.test(variable)) {
            block.setAttribute('error', 'invalid-variable');
            executionItem.setCompleted('error');
            return;
        }

        try {
            await this.variableService.setDateTimeVariable({
                variable,
                value,
                dateType,
            });

            block.setAttribute('executedAt', new Date().toISOString());
            executionItem.setCompleted('success');
        } catch (err) {
            this.logger.error({ ...ctx.execution, blockId, err }, 'Save date input error');
            block.setAttribute('error', 'unexpected-error');
            executionItem.setCompleted('error');
        }
    }
}