import type * as Y from "yjs";
import type { DataFrame } from "@sandworm/types";
import { equals } from "ramda";

import { dataFrameService } from "./services";

// Mirrors apps/api's BlockExecutorDataframeService: keeps the notebook's
// `dataframes` map in step with the DataFrames that exist in Python, and
// records which block made each one.

export function updateDataframesInMap(
  oldDataframes: Y.Map<DataFrame>,
  newDataframes: DataFrame[],
  currentBlockId: string,
  blocks: Set<string>
): void {
  const update = () => {
    const dataframesToUpdate = new Map<string, DataFrame>();
    const dataframesToAdd = new Map(newDataframes.map(df => [df.name, df]));
    const dataframesToRemove = new Set(oldDataframes.keys());

    newDataframes.forEach(dataframe => {
      dataframesToRemove.delete(dataframe.name);
      if (oldDataframes.has(dataframe.name)) {
        dataframesToUpdate.set(dataframe.name, dataframe);
        dataframesToAdd.delete(dataframe.name);
      }
    });

    // Remove only if the block that made it is gone, or we just ran that
    // block and it no longer defines it.
    dataframesToRemove.forEach(name => {
      const df = oldDataframes.get(name);
      if (!df?.blockId) return;
      if (!blocks.has(df.blockId) || df.blockId === currentBlockId) {
        oldDataframes.delete(name);
      }
    });

    dataframesToAdd.forEach((df, name) => {
      oldDataframes.set(name, { ...df, blockId: currentBlockId });
    });

    // Update existing dataframes if their schema changed.
    dataframesToUpdate.forEach((df, name) => {
      const previous = oldDataframes.get(name);
      if (!previous) {
        oldDataframes.set(name, df);
        return;
      }
      if (equals(previous.columns, df.columns)) {
        return;
      }
      oldDataframes.set(name, {
        ...df,
        blockId: df.blockId ?? previous.blockId ?? currentBlockId,
      });
    });
  };

  if (oldDataframes.doc) {
    oldDataframes.doc.transact(update);
  } else {
    update();
  }
}

export async function updateDataframes(
  notebookId: string,
  currentBlockId: string,
  blocks: Set<string>,
  dataframes: Y.Map<DataFrame>
): Promise<void> {
  const newDataframes = await dataFrameService.list(notebookId);
  updateDataframesInMap(dataframes, newDataframes, currentBlockId, blocks);
}
