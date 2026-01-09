// apps/api/src/modules/block-executor/block-executor.config.ts
import { registerAs } from '@nestjs/config';
import { IsInt, IsOptional, Min, Max } from 'class-validator';
import validateConfig from '@/utils/validate-config';
import { BlockExecutorConfig } from './block-executor-config.type';

class EnvironmentVariablesValidator {
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(20)
  BLOCK_EXECUTOR_AI_CONCURRENCY: number;

  @IsInt()
  @IsOptional()
  @Min(1000)
  BLOCK_EXECUTOR_LOCK_TIMEOUT: number;

  @IsInt()
  @IsOptional()
  @Min(100)
  BLOCK_EXECUTOR_RETRY_DELAY: number;

  @IsInt()
  @IsOptional()
  @Min(1000)
  BLOCK_EXECUTOR_MAX_EXECUTION_TIME: number;
}

export default registerAs<BlockExecutorConfig>('blockExecutor', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    aiConcurrency: parseInt(process.env.BLOCK_EXECUTOR_AI_CONCURRENCY || '4', 10),
    lockTimeout: parseInt(process.env.BLOCK_EXECUTOR_LOCK_TIMEOUT || '30000', 10),
    retryDelay: parseInt(process.env.BLOCK_EXECUTOR_RETRY_DELAY || '2000', 10),
    maxExecutionTime: parseInt(process.env.BLOCK_EXECUTOR_MAX_EXECUTION_TIME || '300000', 10),
  };
});