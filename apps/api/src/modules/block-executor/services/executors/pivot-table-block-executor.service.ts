import { Injectable, Logger } from '@nestjs/common';
import * as Y from 'yjs';
import {
    ExecutionQueueItem,
    PivotTableBlock,
    getPivotTableAttributes,
} from '@sandworm/editor';
import { DocumentContext } from './types';
import { createPivotTable } from '../python/pivot-table';

@Injectable()
export class PivotTableBlockExecutorService {
    private readonly logger = new Logger(PivotTableBlockExecutorService.name);

    async run(executionItem: ExecutionQueueItem, block: Y.XmlElement<PivotTableBlock>, ctx: DocumentContext): Promise<void> {
        return this.execute(executionItem, block, ctx, 'create');
    }

    async loadPage(executionItem: ExecutionQueueItem, block: Y.XmlElement<PivotTableBlock>, ctx: DocumentContext): Promise<void> {
        return this.execute(executionItem, block, ctx, 'read');
    }

    private async execute(
        executionItem: ExecutionQueueItem,
        block: Y.XmlElement<PivotTableBlock>,
        ctx: DocumentContext,
        operation: 'create' | 'read',
    ): Promise<void> {
        try {
            const dataframeName = block.getAttribute('dataframeName');
            if (!dataframeName) {
                executionItem.setCompleted('error');
                return;
            }

            const dataframe = ctx.dataframes.get(dataframeName);
            if (!dataframe) {
                executionItem.setCompleted('error');
                return;
            }

            const attrs = getPivotTableAttributes(block, ctx.blocks);

            if (operation === 'create') {
                const rows = attrs.rows.map((r) => r.column).filter(Boolean);
                const cols = attrs.columns.map((c) => c.column).filter(Boolean);
                const metrics = attrs.metrics.map((m) => m.column).filter(Boolean);

                if (rows.length === 0 || cols.length === 0 || metrics.length === 0) {
                    block.setAttribute('updatedAt', new Date().toISOString());
                    block.setAttribute('error', null);
                    executionItem.setCompleted('success');
                    return;
                }

                const allColumns = [...rows, ...cols, ...metrics];
                for (const column of allColumns) {
                    if (column && !dataframe.columns.find((c) => c.name.toString() === column.name.toString())) {
                        block.setAttribute('updatedAt', new Date().toISOString());
                        block.setAttribute('error', null);
                        executionItem.setCompleted('success');
                        return;
                    }
                }
            }

            let aborted = false;
            let cleanup = executionItem.observeStatus((status) => {
                if (status._tag === 'aborting') aborted = true;
            });

            const { promise, abort } = await createPivotTable(
                ctx.execution.workspaceId,
                ctx.execution.sessionId,
                dataframe,
                attrs.rows,
                attrs.columns,
                attrs.metrics,
                attrs.sort,
                attrs.variable.value,
                attrs.page,
                operation,
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

            if (aborted) {
                executionItem.setCompleted('aborted');
                return;
            }

            if (!result.success) {
                if (result.reason !== 'aborted') block.setAttribute('error', result.reason);
                executionItem.setCompleted(result.reason === 'aborted' ? 'aborted' : 'error');
            } else {
                block.setAttribute('updatedAt', new Date().toISOString());
                block.setAttribute('error', null);
                block.setAttribute('result', result.result);
                block.setAttribute('page', result.result.page);
                executionItem.setCompleted('success');
            }
        } catch (err) {
            this.logger.error({ ...ctx.execution, blockId: block.getAttribute('id'), err }, 'Pivot table error');
            block.setAttribute('error', 'unknown');
            executionItem.setCompleted('error');
        }
    }
}