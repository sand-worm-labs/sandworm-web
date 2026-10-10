import type * as Y from "yjs";
import {
  type DateInputBlock,
  type ExecutionQueueItem,
  getDateInputAttributes,
} from "@sandworm/editor";

import { type DocumentContext, VARIABLE_NAME_REGEX } from "../interfaces";
import { variableService } from "../services";

// Mirrors apps/api's DateInputBlockExecutorService.

export async function saveDateInput(
  executionItem: ExecutionQueueItem,
  block: Y.XmlElement<DateInputBlock>,
  ctx: DocumentContext
): Promise<void> {
  const { variable, value, dateType } = getDateInputAttributes(
    block,
    ctx.blocks
  );

  if (!VARIABLE_NAME_REGEX.test(variable)) {
    block.setAttribute("error", "invalid-variable");
    executionItem.setCompleted("error");
    return;
  }

  try {
    await variableService.setDateTimeVariable(ctx.notebookId, {
      variable,
      value,
      dateType,
    });

    block.setAttribute("executedAt", new Date().toISOString());
    executionItem.setCompleted("success");
  } catch {
    block.setAttribute("error", "unexpected-error");
    executionItem.setCompleted("error");
  }
}
