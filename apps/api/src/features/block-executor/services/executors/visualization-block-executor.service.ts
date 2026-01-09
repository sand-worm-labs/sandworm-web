import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as Y from 'yjs';
import {
    ExecutionQueueItem,
    VisualizationV2Block,
    getVisualizationV2Attributes,
    setVisualizationV2Input,
} from '@sandworm/editor';
import { DocumentContext } from '../../interfaces';
import { createVisualizationV2 } from '../python/visualizations-v2';

@Injectable()
export class VisualizationBlockExecutorService {
    private readonly logger = new Logger(VisualizationBlockExecutorService.name);

    constructor(private readonly eventEmitter: EventEmitter2) { }

    async run(
        executionItem: ExecutionQueueItem,
        block: Y.XmlElement<VisualizationV2Block>,
        ctx: DocumentContext,
    ): Promise<void> {
        try {
            const attrs = getVisualizationV2Attributes(block);

            if (!attrs.input.dataframeName) {
                block.setAttribute('output', null);
                block.setAttribute('error', 'dataframe-not-set');
                executionItem.setCompleted('error');
                return;
            }

            const dataframe = ctx.dataframes.get(attrs.input.dataframeName);
            if (!dataframe) {
                block.setAttribute('output', null);
                block.setAttribute('error', 'dataframe-not-found');
                executionItem.setCompleted('error');
                return;
            }

            let aborted = false;
            let cleanup = executionItem.observeStatus((status) => {
                if (status._tag === 'aborting') aborted = true;
            });

            this.eventEmitter.emit('visualization.run', {
                ...ctx.execution,
                chartType: attrs.input.chartType,
            });

            const { promise, abort } = await createVisualizationV2(
                ctx.execution.workspaceId,
                ctx.execution.sessionId,
                dataframe,
                attrs.input,
            );

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

            if (aborted) {
                executionItem.setCompleted('aborted');
                return;
            }

            if (result.success) {
                block.setAttribute('output', {
                    executedAt: new Date().toISOString(),
                    result: result.data,
                    tooManyDataPoints: result.tooManyDataPoints,
                });
                block.setAttribute('error', null);

                // Update filters from result
                const filters = attrs.input.filters.map((f) => {
                    const resultFilter = result.filters.find((rf) => rf.id === f.id);
                    return resultFilter ?? f;
                });
                setVisualizationV2Input(block, { filters });
                executionItem.setCompleted('success');
            } else {
                if (result.reason === 'aborted') {
                    executionItem.setCompleted('aborted');
                } else {
                    block.setAttribute('output', null);
                    block.setAttribute('error', result.reason);
                    executionItem.setCompleted('error');
                }
            }
        } catch (err) {
            this.logger.error(
                { ...ctx.execution, blockId: block.getAttribute('id'), err },
                'Visualization error',
            );
            block.setAttribute('output', null);
            block.setAttribute('error', 'unknown');
            executionItem.setCompleted('error');
        }
    }
}