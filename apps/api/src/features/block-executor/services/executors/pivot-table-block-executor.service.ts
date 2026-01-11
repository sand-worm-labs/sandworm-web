import { Injectable, Logger } from '@nestjs/common';
import * as Y from 'yjs';
import {
    ExecutionQueueItem,
    PivotTableBlock,
    getPivotTableAttributes,
} from '@sandworm/editor';
import { DocumentContext } from '../../interfaces';
import { PivotTableService } from '@/features/code-execution/pivot-table/pivot-table.service';

@Injectable()
export class PivotTableBlockExecutorService {
    private readonly logger = new Logger(PivotTableBlockExecutorService.name);

    constructor(private readonly pivotTableService: PivotTableService) { }

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

            // Check if aborted before starting
            const initialStatus = executionItem.getStatus();
            if (initialStatus._tag === 'aborting') {
                executionItem.setCompleted('aborted');
                return;
            }

            const { promise, abort } = await this.pivotTableService.createPivotTable({
                dataframe,
                rows: attrs.rows,
                columns: attrs.columns,
                metrics: attrs.metrics,
                sort: attrs.sort,
                varName: attrs.variable.value,
                page: attrs.page,
                operation,
            });

            // Set up abort handler
            const unsubscribe = executionItem.observeStatus((status) => {
                if (status._tag === 'aborting') {
                    abort();
                }
            });

            try {
                const result = await promise;

                if (result.success === false) {
                    if (result.reason !== 'aborted') {
                        block.setAttribute('error', result.reason);
                    }

                    executionItem.setCompleted(
                        result.reason === 'aborted' ? 'aborted' : 'error'
                    );
                } else {
                    block.setAttribute('updatedAt', new Date().toISOString());
                    block.setAttribute('error', null);
                    block.setAttribute('result', result.result);
                    block.setAttribute('page', result.result.page);
                    executionItem.setCompleted('success');
                }
            } finally {
                unsubscribe();
            }
        } catch (err) {
            this.logger.error({ ...ctx.execution, blockId: block.getAttribute('id'), err }, 'Pivot table error');
            block.setAttribute('error', 'unknown');
            executionItem.setCompleted('error');
        }
    }
}