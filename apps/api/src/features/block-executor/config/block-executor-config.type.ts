export type BlockExecutorConfig = {
    aiConcurrency: number;
    executionConcurrency: number;
    lockTimeout: number;
    retryDelay: number;
    maxExecutionTime: number;
  };