import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as Y from 'yjs';
import {
    ExecutionQueueItem,
    VisualizationV2Block,
    getVisualizationV2Attributes,
} from '@sandworm/editor';
import { isInvalidVisualizationFilter } from '@sandworm/types';
import { DocumentContext } from './types';
import { createVisualization } from '../python/visualizations';

@Injectable()
export class VisualizationBlockExecutorService {
    private readonly logger = new Logger(VisualizationBlockExecutorService.name);

    constructor(private readonly eventEmitter: EventEmitter2) { }

    async run(
        executionItem: ExecutionQueueItem,
        block: Y.XmlElement<VisualizationV2Block>,
        ctx: DocumentContext,
    ): Promise<void> {
        block.removeAttribute('result');

        try {
            const attrs = getVisualizationV2Attributes(block);
            const { chartType, xAxis, xAxisName, xAxisGroupFunction, xAxisSort, yAxes, histogramBin, histogramFormat, showDataLabels, numberValuesFormat, filters, dataframeName } = attrs;

            if (!dataframeName) {
                executionItem.setCompleted('error');
                return;
            }

            const dataframe = ctx.dataframes.get(dataframeName);
            const hasAValidYAxis = yAxes.some((yAxis) => yAxis.series.some((s) => s.column !== null));

            if (!dataframe || (!xAxis && chartType !== 'number' && chartType !== 'trend') || (!hasAValidYAxis && chartType !== 'histogram')) {
                executionItem.setCompleted('error');
                return;
            }

            const validFilters = filters.filter(
                (f) => dataframe.columns.some((c) => c.name === f.column?.name) && !isInvalidVisualizationFilter(f, dataframe),
            );

            let aborted = false;
            let cleanup = executionItem.observeStatus((status) => {
                if (status._tag === 'aborting') aborted = true;
            });

            this.eventEmitter.emit('visualization.run', { ...ctx.execution, chartType });

            const { promise, abort } = await createVisualization(
                ctx.execution.workspaceId,
                ctx.execution.sessionId,
                dataframe,
                chartType,
                xAxis,
                xAxisName,
                xAxisGroupFunction,
                xAxisSort,
                yAxes,
                histogramFormat,
                histogramBin,
                showDataLabels,
                numberValuesFormat,
                validFilters,
            );

            if (aborted) await abort();

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

            if (Object.keys(result.filterResults).length > 0) {
                const nextFilters = filters.map((f) => result.filterResults[f.id] ?? f);
                block.setAttribute('filters', nextFilters);
            }

            if (aborted) {
                executionItem.setCompleted('aborted');
                block.setAttribute('spec', null);
                return;
            }

            if (!result.success) {
                if (result.reason !== 'aborted') block.setAttribute('error', result.reason);
                executionItem.setCompleted(result.reason === 'aborted' ? 'aborted' : 'error');
                block.setAttribute('spec', null);
                return;
            }

            block.setAttribute('spec', result.spec);
            block.setAttribute('updatedAt', new Date().toISOString());
            block.setAttribute('error', null);
            executionItem.setCompleted('success');
        } catch (err) {
            this.logger.error({ ...ctx.execution, blockId: block.getAttribute('id'), err }, 'Visualization error');
            block.setAttribute('error', 'unknown');
            block.setAttribute('spec', null);
            executionItem.setCompleted('error');
        }
    }
}