import type * as Y from "yjs";
import {
  type ExecutionQueueBatch,
  type ExecutionQueueItem,
  type YBlock,
  ExecutionQueue,
  getBlocks,
  getDataframes,
  isDateInputBlock,
  isDropdownInputBlock,
  isPythonBlock,
  isSQLBlock,
  isTextInputBlock,
} from "@sandworm/editor";
import type { DataFrame } from "@sandworm/types";

import type { DocumentContext } from "./interfaces";
import { runPythonBlock } from "./executors/python-block-executor";
import {
  loadSQLPage,
  renameSQLDataframe,
  runSQLBlock,
} from "./executors/sql-block-executor";
import {
  renameTextVariable,
  saveTextValue,
} from "./executors/input-block-executor";
import {
  renameDropdownVariable,
  saveDropdownValue,
} from "./executors/dropdown-input-block-executor";
import { saveDateInput } from "./executors/date-input-block-executor";

// Mirrors apps/api's DocExecutor for notebooks that run in the browser, which
// the server never executes. Each client runs only the items its own user
// queued, so collaborators run their own cells in their own browser.
export class DocExecutor {
  private isRunning = false;

  private currentExecution: Promise<void> | null = null;

  private stopObserving: (() => void) | null = null;

  private readonly queue: ExecutionQueue;

  private readonly blocks: Y.Map<YBlock>;

  private readonly dataframes: Y.Map<DataFrame>;

  constructor(
    yDoc: Y.Doc,
    private readonly notebookId: string,
    private readonly userId: string | null
  ) {
    this.queue = ExecutionQueue.fromYjs(yDoc);
    this.blocks = getBlocks(yDoc);
    this.dataframes = getDataframes(yDoc);
  }

  start(): void {
    this.isRunning = true;
    // The server polls; here the queue tells us when it changes.
    this.stopObserving = this.queue.observe(() => this.tick());
    this.tick();
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    this.stopObserving?.();
    this.stopObserving = null;
    await this.currentExecution;
  }

  isIdle(): boolean {
    return this.currentExecution === null;
  }

  private buildDocContext(): DocumentContext {
    return {
      notebookId: this.notebookId,
      blocks: this.blocks,
      dataframes: this.dataframes,
    };
  }

  private async tick(): Promise<void> {
    if (!this.isRunning || this.currentExecution) return;

    const batch = this.queue.getCurrentBatch();
    if (!batch) return;

    const current = batch.getCurrent();
    // Someone else's cell: their browser runs it.
    if (current && current.getUserId() !== this.userId) return;

    this.currentExecution = this.processBatch(batch);
    await this.currentExecution;
    this.currentExecution = null;

    if (this.isRunning) {
      setTimeout(() => this.tick(), 0);
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
      case "running":
      case "enqueued":
        await this.executeItem(current);
        break;
      case "completed":
        break;
      case "unknown":
      case "aborting":
        current.setCompleted("aborted");
        break;
      default:
        break;
    }

    // safety net - prevent infinite loop
    if (current.getCompleteStatus() === null) {
      current.setCompleted("error");
    }
  }

  private async executeItem(item: ExecutionQueueItem): Promise<void> {
    item.setRunning();

    const block = this.blocks.get(item.getBlockId());
    if (!block) {
      item.setCompleted("error");
      return;
    }

    const docCtx = this.buildDocContext();
    const metadata = item.getMetadata();

    try {
      switch (metadata._tag) {
        case "python": {
          if (!isPythonBlock(block)) {
            item.setCompleted("error");
            return;
          }
          await runPythonBlock(item, block, docCtx, metadata);
          break;
        }
        case "sql": {
          if (!isSQLBlock(block)) {
            item.setCompleted("error");
            return;
          }
          await runSQLBlock(item, block, docCtx, metadata);
          break;
        }
        case "sql-load-page": {
          if (!isSQLBlock(block)) {
            item.setCompleted("error");
            return;
          }
          await loadSQLPage(item, block, docCtx);
          break;
        }
        case "sql-rename-dataframe": {
          if (!isSQLBlock(block)) {
            item.setCompleted("error");
            return;
          }
          await renameSQLDataframe(item, block, docCtx);
          break;
        }
        case "text-input-save-value": {
          if (!isTextInputBlock(block)) {
            item.setCompleted("error");
            return;
          }
          await saveTextValue(item, block, docCtx);
          break;
        }
        case "text-input-rename-variable": {
          if (!isTextInputBlock(block)) {
            item.setCompleted("error");
            return;
          }
          await renameTextVariable(item, block, docCtx);
          break;
        }
        case "date-input": {
          if (!isDateInputBlock(block)) {
            item.setCompleted("error");
            return;
          }
          await saveDateInput(item, block, docCtx);
          break;
        }
        case "dropdown-input-save-value": {
          if (!isDropdownInputBlock(block)) {
            item.setCompleted("error");
            return;
          }
          await saveDropdownValue(item, block, docCtx);
          break;
        }
        case "dropdown-input-rename-variable": {
          if (!isDropdownInputBlock(block)) {
            item.setCompleted("error");
            return;
          }
          await renameDropdownVariable(item, block, docCtx);
          break;
        }
        case "noop":
          item.setCompleted("success");
          break;
        // Charts, pivot tables and power tools are built by server-side code
        // and aren't available in browser notebooks yet; the safety net in
        // processBatch marks them as errors.
        default:
          break;
      }
    } catch {
      item.setCompleted("error");
    }
  }
}
