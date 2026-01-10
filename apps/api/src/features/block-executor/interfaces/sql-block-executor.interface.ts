import * as Y from 'yjs';
import { ExecutionQueueItem, SQLBlock, ExecutionQueueItemSQLMetadata } from '@sandworm/editor';
import { ExecutionContext } from './execution-context.interface';

export interface ISqlBlockExecutor {

  run(
    executionItem: ExecutionQueueItem,
    block: Y.XmlElement<SQLBlock>,
    metadata: ExecutionQueueItemSQLMetadata,
    context: ExecutionContext,
  ): Promise<void>;


  loadPage(
    executionItem: ExecutionQueueItem,
    block: Y.XmlElement<SQLBlock>,
    page: number,
    context: ExecutionContext,
  ): Promise<void>;


  renameDataframe(
    executionItem: ExecutionQueueItem,
    block: Y.XmlElement<SQLBlock>,
    oldName: string,
    newName: string,
    context: ExecutionContext,
  ): Promise<void>;
}

export interface SqlExecutionResult {
  rows: any[];
  columns: SqlColumn[];
  count: number;
  executionTime: number;
}

export interface SqlColumn {
  name: string;
  type: string;
  nullable?: boolean;
}