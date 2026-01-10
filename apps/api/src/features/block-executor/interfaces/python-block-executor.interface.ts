import * as Y from 'yjs';
import { ExecutionQueueItem, PythonBlock, ExecutionQueueItemPythonMetadata } from '@sandworm/editor';
import { ExecutionContext } from './execution-context.interface';

export interface IPythonBlockExecutor {
  run(
    executionItem: ExecutionQueueItem,
    block: Y.XmlElement<PythonBlock>,
    metadata: ExecutionQueueItemPythonMetadata,
    context: ExecutionContext,
  ): Promise<void>;
}

export interface PythonExecutionResult {
  outputs: PythonOutput[];
  dataframes: string[];
  error?: string;
}

export interface PythonOutput {
  type: 'text' | 'image' | 'table' | 'error' | 'html';
  data: any;
  timestamp: Date;
}