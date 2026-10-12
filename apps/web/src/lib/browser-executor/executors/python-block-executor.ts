import type * as Y from "yjs";
import {
  type ExecutionQueueItem,
  type ExecutionQueueItemPythonMetadata,
  type PythonBlock,
  getPythonAttributes,
} from "@sandworm/editor";
import type { Output } from "@sandworm/types";

import { clearLiveOutputs } from "@/lib/pyodide/liveOutputs";

import type { DocumentContext } from "../interfaces";
import { updateDataframes } from "../block-executor-dataframe";
import { pythonExecutor } from "../services";

// Mirrors apps/api's PythonBlockExecutorService.

function kernelError(err: unknown): Output {
  return {
    type: "error",
    ename: "BrowserRuntimeError",
    evalue: err instanceof Error ? err.message : String(err),
    traceback: [],
  };
}

export async function runPythonBlock(
  executionItem: ExecutionQueueItem,
  block: Y.XmlElement<PythonBlock>,
  ctx: DocumentContext,
  metadata: ExecutionQueueItemPythonMetadata
): Promise<void> {
  block.setAttribute("result", []);

  try {
    block.setAttribute("startQueryTime", new Date().toISOString());

    const { aiSuggestions, source, id: blockId } = getPythonAttributes(block);
    const actualSource =
      (metadata.isSuggestion ? aiSuggestions : source)?.toJSON() ?? "";

    const { promise, abort } = pythonExecutor.executeCode(
      ctx.notebookId,
      blockId,
      actualSource
    );

    let abortP = Promise.resolve(false);
    const cleanup = executionItem.observeStatus(status => {
      if (status._tag === "aborting") {
        abortP = abort().then(() => true);
      }
    });
    if (executionItem.getStatus()._tag === "aborting") {
      abortP = abort().then(() => true);
    }

    let outputs: Output[];
    try {
      outputs = await promise;
    } catch (err) {
      outputs = [kernelError(err)];
    }
    const aborted = await abortP;
    cleanup();

    block.setAttribute("result", outputs);
    // This run's result replaces whatever the cell's previous run kept updating.
    clearLiveOutputs(blockId);
    if (aborted) {
      executionItem.setCompleted("aborted");
      return;
    }

    await updateDataframes(
      ctx.notebookId,
      blockId,
      new Set(ctx.blocks.keys()),
      ctx.dataframes
    );

    block.setAttribute("lastQuery", source.toJSON());
    block.setAttribute("lastQueryTime", new Date().toISOString());
    executionItem.setCompleted(
      outputs.some(o => o.type === "error") ? "error" : "success"
    );
  } catch {
    executionItem.setCompleted("error");
  }
}
