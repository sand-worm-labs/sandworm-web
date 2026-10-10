import type * as Y from "yjs";
import {
  type DropdownInputBlock,
  type ExecutionQueueItem,
  getDropdownInputAttributes,
  updateDropdownInputBlockExecutedAt,
  updateDropdownInputValue,
  updateDropdownInputVariable,
} from "@sandworm/editor";

import { type DocumentContext, VARIABLE_NAME_REGEX } from "../interfaces";
import { variableService } from "../services";

// Mirrors apps/api's DropdownInputBlockExecutorService.

export async function saveDropdownValue(
  executionItem: ExecutionQueueItem,
  block: Y.XmlElement<DropdownInputBlock>,
  ctx: DocumentContext
): Promise<void> {
  const attrs = getDropdownInputAttributes(block, ctx.blocks);
  const { value: variableName } = attrs.variable;
  const { newValue } = attrs.value;

  if (newValue === null) {
    updateDropdownInputValue(block, { error: "invalid-value" });
    executionItem.setCompleted("error");
    return;
  }

  try {
    await variableService.setVariable(ctx.notebookId, variableName, newValue)
      .promise;
    updateDropdownInputValue(block, { value: newValue, error: null });
    updateDropdownInputBlockExecutedAt(block, new Date());
    executionItem.setCompleted("success");
  } catch {
    updateDropdownInputValue(block, { error: "unexpected-error" });
    executionItem.setCompleted("error");
  }
}

export async function renameDropdownVariable(
  executionItem: ExecutionQueueItem,
  block: Y.XmlElement<DropdownInputBlock>,
  ctx: DocumentContext
): Promise<void> {
  const attrs = getDropdownInputAttributes(block, ctx.blocks);
  const { newValue: newVariableName } = attrs.variable;
  const { value } = attrs.value;

  if (!VARIABLE_NAME_REGEX.test(newVariableName)) {
    updateDropdownInputVariable(block, ctx.blocks, {
      error: "invalid-variable-name",
    });
    executionItem.setCompleted("error");
    return;
  }

  if (value === null) {
    updateDropdownInputValue(block, { error: "invalid-value" });
    executionItem.setCompleted("error");
    return;
  }

  try {
    const { promise, abort } = variableService.setVariable(
      ctx.notebookId,
      newVariableName,
      value
    );

    let abortP = Promise.resolve(false);
    const cleanup = executionItem.observeStatus(status => {
      if (status._tag === "aborting") {
        abortP = abort().then(() => true);
      }
    });

    await promise;
    const aborted = await abortP;
    cleanup();

    if (!aborted) {
      updateDropdownInputVariable(block, ctx.blocks, {
        value: newVariableName,
        error: null,
      });
    }
    block.setAttribute("executedAt", new Date().toISOString());
    executionItem.setCompleted(aborted ? "aborted" : "success");
  } catch {
    updateDropdownInputVariable(block, ctx.blocks, {
      error: "unexpected-error",
    });
    executionItem.setCompleted("error");
  }
}
