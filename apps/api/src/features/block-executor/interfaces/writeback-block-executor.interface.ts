
import * as Y from 'yjs';
import { ExecutionQueueItem, WritebackBlock } from '@sandworm/editor';
import { ExecutionContext } from './execution-context.interface';

export interface IWritebackBlockExecutor {
  run(
    executionItem: ExecutionQueueItem,
    block: Y.XmlElement<WritebackBlock>,
    context: ExecutionContext,
  ): Promise<void>;
}

export interface WritebackConfig {
  dataframeName: string;
  tableName: string;
  writeMode: WriteMode;
  dataSourceId: string;
  primaryKey?: string | string[];
  columnMapping?: Record<string, string>;
}

export type WriteMode = 'append' | 'replace' | 'upsert';

export interface WritebackResult {
  rowsWritten: number;
  rowsUpdated?: number;
  rowsInserted?: number;
  executionTime: number;
  error?: string;
}