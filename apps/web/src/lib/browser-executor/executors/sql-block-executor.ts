import type * as Y from "yjs";
import {
  type ExecutionQueueItem,
  type ExecutionQueueItemSQLMetadata,
  type SQLBlock,
  getSQLAttributes,
} from "@sandworm/editor";
import type { RunQueryResult } from "@sandworm/types";

import { type DocumentContext, VARIABLE_NAME_REGEX } from "../interfaces";
import { updateDataframesInMap } from "../block-executor-dataframe";
import { dataFrameService, queryExecution } from "../services";

// Mirrors apps/api's SqlBlockExecutorService. Queries always run in DuckDB in
// the browser: a Live notebook never reaches the cloud's data sources.

function queryDuration(result: RunQueryResult | null): number | undefined {
  return result?.type === "success" && "queryDurationMs" in result
    ? result.queryDurationMs
    : undefined;
}

export async function runSQLBlock(
  executionItem: ExecutionQueueItem,
  block: Y.XmlElement<SQLBlock>,
  ctx: DocumentContext,
  metadata: ExecutionQueueItemSQLMetadata
): Promise<void> {
  try {
    block.setAttribute("startQueryTime", new Date().toISOString());

    let aborted = false;
    let cleanup = executionItem.observeStatus(status => {
      if (status._tag === "aborting") aborted = true;
    });

    const {
      id: blockId,
      aiSuggestions,
      source,
      dataframeName,
    } = getSQLAttributes(block, ctx.blocks);

    if (!dataframeName.value) {
      executionItem.setCompleted("error");
      cleanup();
      return;
    }

    if (aborted) {
      executionItem.setCompleted("aborted");
      block.setAttribute("result", {
        type: "abort-error",
        message: "Query aborted",
      });
      cleanup();
      return;
    }

    block.setAttribute("result", null);
    block.setAttribute("page", 0);
    block.setAttribute("sort", null);

    let actualSource =
      (metadata.isSuggestion ? aiSuggestions : source)?.toJSON().trim() ?? "";
    if (metadata.selectedCode) {
      actualSource = metadata.selectedCode;
    }

    let resultType: RunQueryResult["type"] | "empty-query" = "empty-query";

    if (actualSource !== "") {
      const startedAt = Date.now();
      const { promise, abort } = queryExecution.makeSQLQuery(
        ctx.notebookId,
        dataframeName.value,
        actualSource
      );
      cleanup();

      let abortP = Promise.resolve(aborted);
      if (aborted) abortP = abort().then(() => true);
      cleanup = executionItem.observeStatus(status => {
        if (status._tag === "aborting") {
          abortP = abort().then(() => true);
        }
      });

      const result: RunQueryResult = await promise.catch(err => ({
        type: "syntax-error" as const,
        message: err instanceof Error ? err.message : String(err),
      }));
      aborted = await abortP;
      cleanup();

      if (aborted) {
        executionItem.setCompleted("aborted");
        block.setAttribute("result", {
          type: "abort-error",
          message: "Query aborted",
        });
        return;
      }

      block.setAttribute("lastQuery", actualSource);
      block.setAttribute("lastQueryTime", new Date().toISOString());
      block.setAttribute(
        "result",
        result.type === "success"
          ? { ...result, queryDurationMs: Date.now() - startedAt }
          : result
      );

      if (result.type === "success") {
        ctx.dataframes.set(dataframeName.value, {
          id: blockId,
          name: dataframeName.value,
          columns: result.columns,
          blockId,
          updatedAt: new Date().toISOString(),
        });
      }

      resultType = result.type;
    } else {
      cleanup();
    }

    executionItem.setCompleted(
      resultType === "success"
        ? "success"
        : resultType === "abort-error"
          ? "aborted"
          : "error"
    );
  } catch {
    executionItem.setCompleted("error");
  }
}

export async function loadSQLPage(
  executionItem: ExecutionQueueItem,
  block: Y.XmlElement<SQLBlock>,
  ctx: DocumentContext
): Promise<void> {
  try {
    const attrs = getSQLAttributes(block, ctx.blocks);
    const queryDurationMs = queryDuration(attrs.result);

    const nextResult = await dataFrameService.readPage(
      ctx.notebookId,
      attrs.dataframeName.value,
      attrs.page,
      attrs.sort
    );

    switch (nextResult.type) {
      case "success":
        block.setAttribute("result", { ...nextResult, queryDurationMs });
        executionItem.setCompleted("success");
        break;
      case "abort-error":
        block.setAttribute("result", nextResult);
        executionItem.setCompleted("aborted");
        break;
      default:
        block.setAttribute("result", nextResult);
        executionItem.setCompleted("error");
    }
  } catch {
    executionItem.setCompleted("error");
  }
}

export async function renameSQLDataframe(
  executionItem: ExecutionQueueItem,
  block: Y.XmlElement<SQLBlock>,
  ctx: DocumentContext
): Promise<void> {
  const {
    id: blockId,
    dataframeName,
    result,
  } = getSQLAttributes(block, ctx.blocks);

  if (!VARIABLE_NAME_REGEX.test(dataframeName.newValue)) {
    block.setAttribute("dataframeName", {
      ...dataframeName,
      error: "invalid-name",
    });
    executionItem.setCompleted("error");
    return;
  }

  if (result?.type !== "success") {
    block.setAttribute("dataframeName", {
      ...dataframeName,
      value: dataframeName.newValue,
    });
    executionItem.setCompleted(
      result?.type === "abort-error" ? "aborted" : "error"
    );
    return;
  }

  try {
    await dataFrameService.rename(
      ctx.notebookId,
      dataframeName.value,
      dataframeName.newValue
    );

    const dataframes = await dataFrameService.list(ctx.notebookId);
    updateDataframesInMap(
      ctx.dataframes,
      dataframes,
      blockId,
      new Set(ctx.blocks.keys())
    );

    block.setAttribute("dataframeName", {
      ...dataframeName,
      value: dataframeName.newValue,
      error: undefined,
    });
    executionItem.setCompleted("success");
  } catch {
    executionItem.setCompleted("error");
  }
}
