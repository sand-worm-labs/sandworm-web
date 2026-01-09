import { Injectable, Logger } from '@nestjs/common';
import * as Y from 'yjs';
import {
    ExecutionQueueItem,
    DateInputBlock,
    getDateInputAttributes,
} from '@sandworm/editor';
import { DocumentContext } from '../../interfaces';
import { VARIABLE_NAME_REGEX } from './utils';
import { setDateTimeVariable } from '../python/input';

@Injectable()
export class DateInputBlockExecutorService {
    private readonly logger = new Logger(DateInputBlockExecutorService.name);

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
            await setDateTimeVariable(
                ctx.execution.workspaceId,
                ctx.execution.sessionId,
                variable,
                value,
                dateType,
            );

            block.setAttribute('executedAt', new Date().toISOString());
            executionItem.setCompleted('success');
        } catch (err) {
            this.logger.error({ ...ctx.execution, blockId, err }, 'Save date input error');
            block.setAttribute('error', 'unexpected-error');
            executionItem.setCompleted('error');
        }
    }
}