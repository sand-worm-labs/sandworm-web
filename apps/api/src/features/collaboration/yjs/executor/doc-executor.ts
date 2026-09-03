// features/collaboration/yjs/executor/doc-executor.ts
import * as Y from 'yjs';
import PQueue from 'p-queue';
import { Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  ExecutionQueue,
  ExecutionQueueBatch,
  ExecutionQueueItem,
  isPythonBlock,
  isSQLBlock,
  isVisualizationV2Block,
  isDateInputBlock,
  isDropdownInputBlock,
  isTextInputBlock,
  isPivotTableBlock,
  isPowerToolboxBlock,
  YBlock,
} from '@sandworm/editor';
import { exhaustiveCheck } from '@sandworm/types';
import { LockService } from '@/infrastructure/lock/lock.services';
import { PythonBlockExecutorService } from '@/features/block-executor/services/executors/python-block-executor.service';
import { SqlBlockExecutorService } from '@/features/block-executor/services/executors/sql-block-executor.service';
import { VisualizationBlockExecutorService } from '@/features/block-executor/services/executors/visualization-block-executor.service';
import { InputBlockExecutorService } from '@/features/block-executor/services/executors/input-block-executor.service';
import { DateInputBlockExecutorService } from '@/features/block-executor/services/executors/date-input-block-executor.service';
import { DropdownInputBlockExecutorService } from '@/features/block-executor/services/executors/dropdown-input-block-executor.service';
import { PivotTableBlockExecutorService } from '@/features/block-executor/services/executors/pivot-table-block-executor.service';
import { PowerToolboxBlockExecutorService } from '@/features/block-executor/services/executors/power-toolbox-block-executor.service';
import { DocumentContext, ExecutionContext } from '@/features/block-executor/interfaces';

export interface DocExecutorServices {
  python: PythonBlockExecutorService;
  sql: SqlBlockExecutorService;
  visualization: VisualizationBlockExecutorService;
  input: InputBlockExecutorService;
  dateInput: DateInputBlockExecutorService;
  dropdownInput: DropdownInputBlockExecutorService;
  pivotTable: PivotTableBlockExecutorService;
  powerToolbox: PowerToolboxBlockExecutorService;
  lock: LockService;
}

export class DocExecutor {
  private readonly id = uuidv4();
  private readonly logger = new Logger(DocExecutor.name);
  private isRunning = false;
  private currentExecution: Promise<void> | null = null;
  private readonly queue: ExecutionQueue;

  constructor(
    private readonly docId: string,
    private readonly workspaceId: string,
    private readonly documentId: string,
    private readonly ydoc: Y.Doc,
    private readonly blocks: Y.Map<YBlock>,
    private readonly dataframes: Y.Map<any>,
    private readonly services: DocExecutorServices,
  ) {
    this.queue = ExecutionQueue.fromYjs(ydoc);
  }

  start(): void {
    this.isRunning = true;
    this.runLoop();
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    await this.currentExecution;
  }

  isIdle(): boolean {
    return this.currentExecution === null;
  }

  private buildContext(): ExecutionContext {
    return {
      sessionId: this.docId,
      workspaceId: this.workspaceId,
      documentId: this.documentId,
    };
  }

  private buildDocContext(): DocumentContext {
    return {
      blocks: this.blocks,
      dataframes: this.dataframes,
      execution: this.buildContext(),
    };
  }

  private async runLoop(): Promise<void> {
    try {
      await this.services.lock.acquireLock(
        `executor:${this.docId}`,
        () => new Promise<void>(async (resolve, reject) => {
          if (!this.isRunning) {
            resolve();
            return;
          }

          const tick = async () => {
            try {
              if (!this.isRunning) {
                resolve();
                return;
              }

              const batch = this.queue.getCurrentBatch();
              if (!batch) {
                setTimeout(() => tick(), 500);
                return;
              }

              this.currentExecution = this.processBatch(batch);
              await this.currentExecution;
              this.currentExecution = null;

              if (this.isRunning) {
                setTimeout(() => tick(), 0);
              }
            } catch (err) {
              reject(err);
            }
          };

          tick();
        }),
      );
    } catch (err) {
      this.logger.error(
        { docId: this.docId, workspaceId: this.workspaceId, err },
        'Executor loop error, retrying in 2s',
      );
      setTimeout(() => this.runLoop(), 2000);
    }
  }

  private async processBatch(batch: ExecutionQueueBatch): Promise<void> {
    const current = batch.getCurrent();
    if (!current) {
      this.queue.advance();
      return;
    }

    const status = current.getStatus();
    switch (status._tag) {
      case 'running':
      case 'enqueued':
        await this.executeItem(current);
        break;
      case 'completed':
        break;
      case 'unknown':
      case 'aborting':
        current.setCompleted('aborted');
        break;
      default:
        exhaustiveCheck(status);
    }

    // safety net - prevent infinite loop
    if (current.getCompleteStatus() === null) {
      this.logger.error(
        { docId: this.docId, blockId: current.getBlockId() },
        'Item did not complete, forcing error',
      );
      current.setCompleted('error');
    }
  }

  private async executeItem(item: ExecutionQueueItem): Promise<void> {
    item.setRunning();

    const block = this.blocks.get(item.getBlockId());
    if (!block) {
      this.logger.error({ blockId: item.getBlockId() }, 'Block not found');
      item.setCompleted('error');
      return;
    }

    const ctx = this.buildContext();
    const docCtx = this.buildDocContext();
    const metadata = item.getMetadata();

    try {
      switch (metadata._tag) {
        case 'python': {
          if (!isPythonBlock(block)) { item.setCompleted('error'); return; }
          await this.services.python.run(ctx, item, block, docCtx, metadata);
          break;
        }
        case 'sql': {
          if (!isSQLBlock(block)) { item.setCompleted('error'); return; }
          await this.services.sql.run(item, block, docCtx, metadata);
          break;
        }
        case 'sql-load-page': {
          if (!isSQLBlock(block)) { item.setCompleted('error'); return; }
          await this.services.sql.loadPage(ctx, item, block, docCtx);
          break;
        }
        case 'sql-rename-dataframe': {
          if (!isSQLBlock(block)) { item.setCompleted('error'); return; }
          await this.services.sql.renameDataframe(ctx, item, block, docCtx);
          break;
        }
        case 'visualization':
          break;
        case 'writeback':
          break;
        case 'visualization-v2': {
          if (!isVisualizationV2Block(block)) { item.setCompleted('error'); return; }
          await this.services.visualization.run(ctx, item, block, docCtx);
          break;
        }
        case 'text-input-save-value': {
          if (!isTextInputBlock(block)) { item.setCompleted('error'); return; }
          await this.services.input.saveTextValue(ctx, item, block, docCtx);
          break;
        }
        case 'text-input-rename-variable': {
          if (!isTextInputBlock(block)) { item.setCompleted('error'); return; }
          await this.services.input.renameTextVariable(ctx, item, block, docCtx);
          break;
        }
        case 'date-input': {
          if (!isDateInputBlock(block)) { item.setCompleted('error'); return; }
          await this.services.dateInput.save(ctx, item, block, docCtx);
          break;
        }
        case 'dropdown-input-save-value': {
          if (!isDropdownInputBlock(block)) { item.setCompleted('error'); return; }
          await this.services.dropdownInput.saveValue(ctx, item, block, docCtx);
          break;
        }
        case 'dropdown-input-rename-variable': {
          if (!isDropdownInputBlock(block)) { item.setCompleted('error'); return; }
          await this.services.dropdownInput.renameVariable(ctx, item, block, docCtx);
          break;
        }
        case 'pivot-table': {
          if (!isPivotTableBlock(block)) { item.setCompleted('error'); return; }
          await this.services.pivotTable.run(ctx, item, block, docCtx);
          break;
        }
        case 'pivot-table-load-page': {
          if (!isPivotTableBlock(block)) { item.setCompleted('error'); return; }
          await this.services.pivotTable.loadPage(ctx, item, block, docCtx);
          break;
        }
        case 'power-toolbox': {
          if (!isPowerToolboxBlock(block)) { item.setCompleted('error'); return; }
          await this.services.powerToolbox.run(ctx, item, block, docCtx);
          break;
        }
        case 'noop':
          item.setCompleted('success');
          break;
        default:
          exhaustiveCheck(metadata);
      }
    } catch (err) {
      this.logger.error(
        { docId: this.docId, blockId: item.getBlockId(), err },
        'Unhandled error in executeItem',
      );
      item.setCompleted('error');
    }
  }
}