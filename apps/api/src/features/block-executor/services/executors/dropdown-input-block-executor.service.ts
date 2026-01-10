import { Injectable, Logger } from '@nestjs/common';
import * as Y from 'yjs';
import {
    ExecutionQueueItem,
    DropdownInputBlock,
    YBlock,
    getDropdownInputAttributes,
    updateDropdownInputValue,
    updateDropdownInputVariable,
    updateDropdownInputBlockExecutedAt,
} from '@sandworm/editor';
import { DocumentContext } from '../../interfaces';
import { VARIABLE_NAME_REGEX } from '@/features/code-execution/utils';
import { VariableService } from '@/features/code-execution/variable.service';

@Injectable()
export class DropdownInputBlockExecutorService {
    private readonly logger = new Logger(DropdownInputBlockExecutorService.name);

    async saveValue(
        executionItem: ExecutionQueueItem,
        block: Y.XmlElement<DropdownInputBlock>,
        ctx: DocumentContext,
    ): Promise<void> {
        const attrs = getDropdownInputAttributes(block, ctx.blocks);
        const { value: variableName } = attrs.variable;
        const { newValue } = attrs.value;

        if (newValue === null) {
            updateDropdownInputValue(block, { error: 'invalid-value' });
            executionItem.setCompleted('error');
            return;
        }

        try {
            await setVariable(ctx.execution.workspaceId, ctx.execution.sessionId, variableName, newValue).then(
                ({ promise }) => promise,
            );

            updateDropdownInputValue(block, { value: newValue, error: null });
            updateDropdownInputBlockExecutedAt(block, new Date());
            executionItem.setCompleted('success');
        } catch (err) {
            this.logger.error({ ...ctx.execution, blockId: attrs.id, err }, 'Save dropdown value error');
            updateDropdownInputValue(block, { error: 'unexpected-error' });
            executionItem.setCompleted('error');
        }
    }

    async renameVariable(
        executionItem: ExecutionQueueItem,
        block: Y.XmlElement<DropdownInputBlock>,
        ctx: DocumentContext,
    ): Promise<void> {
        const attrs = getDropdownInputAttributes(block, ctx.blocks);
        const { newValue: newVariableName } = attrs.variable;
        const { value } = attrs.value;

        if (!VARIABLE_NAME_REGEX.test(newVariableName)) {
            updateDropdownInputVariable(block, ctx.blocks, { error: 'invalid-variable-name' });
            executionItem.setCompleted('error');
            return;
        }

        if (value === null) {
            updateDropdownInputValue(block, { error: 'invalid-value' });
            executionItem.setCompleted('error');
            return;
        }

        try {
            let aborted = false;
            let cleanup = executionItem.observeStatus((status) => {
                if (status._tag === 'aborting') {
                    aborted = true;
                }
            });

            const { promise, abort } = await setVariable(
                ctx.execution.workspaceId,
                ctx.execution.sessionId,
                newVariableName,
                value,
            );

            if (aborted) {
                await abort();
            }

            let abortP = Promise.resolve(aborted);
            cleanup();
            cleanup = executionItem.observeStatus((status) => {
                if (status._tag === 'aborting') {
                    abortP = abort().then(() => true);
                }
            });

            await promise;
            aborted = await abortP;
            cleanup();

            if (!aborted) {
                updateDropdownInputVariable(block, ctx.blocks, { value: newVariableName, error: null });
            }
            block.setAttribute('executedAt', new Date().toISOString());
            executionItem.setCompleted(aborted ? 'aborted' : 'success');
        } catch (err) {
            this.logger.error({ ...ctx.execution, blockId: attrs.id, err }, 'Rename dropdown variable error');
            updateDropdownInputVariable(block, ctx.blocks, { error: 'unexpected-error' });
            executionItem.setCompleted('error');
        }
    }
}