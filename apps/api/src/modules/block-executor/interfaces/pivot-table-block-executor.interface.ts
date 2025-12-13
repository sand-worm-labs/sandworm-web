import * as Y from 'yjs';
import { ExecutionQueueItem, PivotTableBlock } from '@sandworm/editor';
import { ExecutionContext } from './execution-context.interface';

export interface IPivotTableBlockExecutor {
  /**
   * Execute pivot table computation
   */
  run(
    executionItem: ExecutionQueueItem,
    block: Y.XmlElement<PivotTableBlock>,
    context: ExecutionContext,
  ): Promise<void>;

  /**
   * Load a specific page of pivot results
   */
  loadPage(
    executionItem: ExecutionQueueItem,
    block: Y.XmlElement<PivotTableBlock>,
    page: number,
  ): Promise<void>;

  /**
   * Update sort configuration
   */
  updateSort(
    executionItem: ExecutionQueueItem,
    block: Y.XmlElement<PivotTableBlock>,
    sortConfig: PivotSortConfig,
  ): Promise<void>;
}

export interface PivotTableConfig {
  dataframeName: string;
  rowFields: string[];
  columnFields: string[];
  valueFields: PivotValueField[];
  filters?: PivotFilter[];
}

export interface PivotValueField {
  field: string;
  aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'median';
  label?: string;
}

export interface PivotFilter {
  field: string;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'in' | 'not in';
  value: any;
}

export interface PivotSortConfig {
  field: string;
  direction: 'asc' | 'desc';
}