export interface IBlockExecutor {

  enqueue(
    blockId: string,
    metadata?: Record<string, any>,
  ): Promise<void>;


  executeBlock(
    blockId: string,
    metadata?: Record<string, any>,
  ): Promise<void>;

 
  abort(blockId: string): Promise<boolean>;

  getStatus(blockId: string): ExecutionStatus | null;

  destroy(): void;
}

export type ExecutionStatus = 
  | { _tag: 'idle' }
  | { _tag: 'enqueued'; position: number }
  | { _tag: 'running'; startedAt: Date }
  | { _tag: 'aborting' }
  | { _tag: 'completed'; result: 'success' | 'error' | 'aborted'; completedAt: Date };
