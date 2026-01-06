import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as Y from 'yjs';
import {
    ExecutionQueueItem,
    WritebackBlock,
    getWritebackAttributes,
} from '@sandworm/editor';
import { DocumentContext } from '../../interfaces';
import { writeback } from '../../python/writeback';

@Injectable()
export class WritebackBlockExecutorService {
    private readonly logger = new Logger(WritebackBlockExecutorService.name);

    constructor(private readonly eventEmitter: EventEmitter2) { }

    async run(
        executionItem: ExecutionQueueItem,
        block: Y.XmlElement<WritebackBlock>,
        ctx: DocumentContext,
    ): Promise<void> {
        this.eventEmitter.emit('writeback.run', {
            ...ctx.execution,
            blockId: block.getAttribute('id'),
        });

        block.setAttribute('result', null);

        try {
            const executedAt = new Date();
            const attrs = getWritebackAttributes(block);

            let aborted = false;
            let cleanup = executionItem.observeStatus((status) => {
                if (status._tag === 'aborting') {
                    aborted = true;
                }
            });

            if (aborted) {
                cleanup();
                executionItem.setCompleted('aborted');
                return;
            }

            if (!attrs.dataframeName) {
                block.setAttribute('result', {
                    _tag: 'error',
                    step: 'validation',
                    reason: 'dataframe-not-found',
                    executedAt: executedAt.toISOString(),
                });
                executionItem.setCompleted('error');
                cleanup();
                return;
            }

            const tableName = attrs.tableName.toJSON();

            const { promise, abort } = await writeback(
                ctx.execution.workspaceId,
                ctx.execution.sessionId,
                attrs.dataframeName,
                tableName,
                attrs.overwriteTable,
                attrs.onConflict,
                attrs.onConflictColumns,
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

            const result = await promise;
            aborted = await abortP;
            cleanup();

            block.setAttribute('result', result);
            executionItem.setCompleted(
                aborted ? 'aborted' : result._tag === 'success' ? 'success' : 'error',
            );
        } catch (err) {
            this.logger.error(
                { ...ctx.execution, blockId: block.getAttribute('id'), err },
                'Writeback error',
            );
            executionItem.setCompleted('error');
        }
    }
}