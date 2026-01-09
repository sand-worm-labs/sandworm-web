import { Injectable, Logger } from '@nestjs/common';
import * as Y from 'yjs';
import {
    ExecutionQueueItem,
    InputBlock,
    DateInputBlock,
    DropdownInputBlock,
    getInputAttributes,
    getDateInputAttributes,
    getDropdownInputAttributes,
    updateInputValue,
    updateInputVariable,
    updateInputBlockExecutedAt,
    updateDropdownInputValue,
    updateDropdownInputVariable,
    updateDropdownInputBlockExecutedAt,
} from '@sandworm/editor';
import { DocumentContext } from '../../interfaces';
import { VARIABLE_NAME_REGEX } from './utils';
import { setVariable, setDateTimeVariable } from '../python/input';

@Injectable()
export class InputBlockExecutorService {
    private readonly logger = new Logger(InputBlockExecutorService.name);

    // Text Input
    async saveTextValue(
        executionItem: ExecutionQueueItem,
        block: Y.XmlElement<InputBlock>,
        ctx: DocumentContext,
    ): Promise<void> {
        try {
            const attrs = getInputAttributes(block, ctx.blocks);
            const { value: variableName } = attrs.variable;
            const { newValue } = attrs.value;

            await setVariable(ctx.execution.workspaceId, ctx.execution.sessionId, variableName, newValue).then(
                ({ promise }) => promise,
            );

            updateInputValue(block, { value: newValue, error: null });
            updateInputBlockExecutedAt(block, new Date());
            executionItem.setCompleted('success');
        } catch (err) {
            this.logger.error({ ...ctx.execution, blockId: executionItem.getBlockId(), err }, 'Save text input error');
            updateInputValue(block, { error: 'unexpected-error' });
            executionItem.setCompleted('error');
        }
    }

    async renameTextVariable(
        executionItem: ExecutionQueueItem,
        block: Y.XmlElement<InputBlock>,
        ctx: DocumentContext,
    ): Promise<void> {
        try {
            const attrs = getInputAttributes(block, ctx.blocks);
            const { newValue: newVariableName } = attrs.variable;
            const { value } = attrs.value;

            if (!VARIABLE_NAME_REGEX.test(newVariableName)) {
                updateInputVariable(block, ctx.blocks, { error: 'invalid-variable-name' });
                executionItem.setCompleted('error');
                return;
            }

            const { promise, abort } = await setVariable(
                ctx.execution.workspaceId,
                ctx.execution.sessionId,
                newVariableName,
                value,
            );

            let aborted = false;
            const cleanup = executionItem.observeStatus((status) => {
                if (status._tag === 'aborting') {
                    abort();
                    aborted = true;
                }
            });

            await promise;
            cleanup();

            if (!aborted) {
                updateInputVariable(block, ctx.blocks, { value: newVariableName, error: null });
            }
            executionItem.setCompleted(aborted ? 'aborted' : 'success');
        } catch (err) {
            this.logger.error({ ...ctx.execution, blockId: executionItem.getBlockId(), err }, 'Rename text variable error');
            updateInputVariable(block, ctx.blocks, { error: 'unexpected-error' });
            executionItem.setCompleted('error');
        }
    }

    // Date Input
    async saveDateValue(
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
            await setDateTimeVariable(ctx.execution.workspaceId, ctx.execution.sessionId, variable, value, dateType);
            block.setAttribute('executedAt', new Date().toISOString());
            executionItem.setCompleted('success');
        } catch (err) {
            this.logger.error({ ...ctx.execution, blockId, err }, 'Save date input error');
            block.setAttribute('error', 'unexpected-error');
            executionItem.setCompleted('error');
        }
    }

    // Dropdown Input
    async saveDropdownValue(
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
            this.logger.error({ ...ctx.execution, blockId: executionItem.getBlockId(), err }, 'Save dropdown value error');
            updateDropdownInputValue(block, { error: 'unexpected-error' });
            executionItem.setCompleted('error');
        }
    }

    async renameDropdownVariable(
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
            const { promise, abort } = await setVariable(
                ctx.execution.workspaceId,
                ctx.execution.sessionId,
                newVariableName,
                value,
            );

            let aborted = false;
            const cleanup = executionItem.observeStatus((status) => {
                if (status._tag === 'aborting') {
                    abort();
                    aborted = true;
                }
            });

            await promise;
            cleanup();

            if (!aborted) {
                updateDropdownInputVariable(block, ctx.blocks, { value: newVariableName, error: null });
            }
            block.setAttribute('executedAt', new Date().toISOString());
            executionItem.setCompleted(aborted ? 'aborted' : 'success');
        } catch (err) {
            this.logger.error(
                { ...ctx.execution, blockId: executionItem.getBlockId(), err },
                'Rename dropdown variable error',
            );
            updateDropdownInputVariable(block, ctx.blocks, { error: 'unexpected-error' });
            executionItem.setCompleted('error');
        }
    }
}