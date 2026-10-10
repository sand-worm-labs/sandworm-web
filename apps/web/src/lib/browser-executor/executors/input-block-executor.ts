import type * as Y from "yjs";
import {
  type ExecutionQueueItem,
  type InputBlock,
  getInputAttributes,
  updateInputBlockExecutedAt,
  updateInputValue,
  updateInputVariable,
} from "@sandworm/editor";

import { type DocumentContext, VARIABLE_NAME_REGEX } from "../interfaces";
import { variableService } from "../services";

// Mirrors apps/api's InputBlockExecutorService (text inputs).

export async function saveTextValue(
  executionItem: ExecutionQueueItem,
  block: Y.XmlElement<InputBlock>,
  ctx: DocumentContext
): Promise<void> {
  try {
    const attrs = getInputAttributes(block, ctx.blocks);
    const { value: variableName } = attrs.variable;
    const { newValue } = attrs.value;

    await variableService.setVariable(ctx.notebookId, variableName, newValue)
      .promise;

    updateInputValue(block, { value: newValue, error: null });
    updateInputBlockExecutedAt(block, new Date());
    executionItem.setCompleted("success");
  } catch {
    updateInputValue(block, { error: "unexpected-error" });
    executionItem.setCompleted("error");
  }
}

export async function renameTextVariable(
  executionItem: ExecutionQueueItem,
  block: Y.XmlElement<InputBlock>,
  ctx: DocumentContext
): Promise<void> {
  try {
    const attrs = getInputAttributes(block, ctx.blocks);
    const { newValue: newVariableName } = attrs.variable;
    const { value } = attrs.value;

    if (!VARIABLE_NAME_REGEX.test(newVariableName)) {
      updateInputVariable(block, ctx.blocks, {
        error: "invalid-variable-name",
      });
      executionItem.setCompleted("error");
      return;
    }

    const { promise, abort } = variableService.setVariable(
      ctx.notebookId,
      newVariableName,
      value
    );

    let aborted = false;
    const cleanup = executionItem.observeStatus(status => {
      if (status._tag === "aborting") {
        abort();
        aborted = true;
      }
    });

    await promise;
    cleanup();

    if (!aborted) {
      updateInputVariable(block, ctx.blocks, {
        value: newVariableName,
        error: null,
      });
    }
    executionItem.setCompleted(aborted ? "aborted" : "success");
  } catch {
    updateInputVariable(block, ctx.blocks, { error: "unexpected-error" });
    executionItem.setCompleted("error");
  }
}
