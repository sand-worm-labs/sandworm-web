import type * as Y from "yjs";
import { useEffect, useRef } from "react";
import {
  BlockType,
  type ExecutionQueue,
  getBlocks,
  getLayout,
} from "@sandworm/editor";

import { DocumentRuntime } from "@/generated/graphql";
import type { Document } from "@/types";
import { DocExecutor } from "@/lib/browser-executor/doc-executor";

// Two kinds of notebook run in the browser, never on the cloud: local
// analysis, and live dashboards that re-run for each viewer. Cloud notebooks
// are for heavy research and SQL warehouses.
export function isBrowserNotebook(
  document: Pick<Document, "runtime"> | null | undefined
): boolean {
  return (
    document?.runtime === DocumentRuntime.BrowserAnalysis ||
    document?.runtime === DocumentRuntime.BrowserDashboard
  );
}

// Blocks a browser notebook can't have: they're built by cloud-side code.
// Charts can still be made in a Python cell.
const CLOUD_ONLY_BLOCKS = new Set<BlockType>([
  BlockType.PowerToolbox,
  BlockType.Visualization,
  BlockType.VisualizationV2,
  BlockType.PivotTable,
]);

export function canAddBlock(type: BlockType, isBrowserRuntime: boolean) {
  return !isBrowserRuntime || !CLOUD_ONLY_BLOCKS.has(type);
}

// For a browser notebook: runs this user's queued cells in this tab. A live
// dashboard also runs in full whenever it's opened, editor or published view:
// browser Python starts empty on every load, and the dashboard should always
// show fresh results. Returns whether the notebook runs in the browser.
export function useLiveNotebook(opts: {
  document: Pick<Document, "id" | "runtime">;
  yDoc: Y.Doc;
  executionQueue: ExecutionQueue;
  userId: string | null;
  syncing: boolean;
}): boolean {
  const { document, yDoc, executionQueue, userId, syncing } = opts;
  const isLive = isBrowserNotebook(document);
  const isDashboard = document.runtime === DocumentRuntime.BrowserDashboard;

  useEffect(() => {
    if (!isLive) return undefined;
    const executor = new DocExecutor(yDoc, document.id, userId);
    executor.start();
    return () => {
      executor.stop();
    };
  }, [isLive, yDoc, document.id, userId]);

  const ranOnOpen = useRef(false);
  useEffect(() => {
    if (!isDashboard || syncing || !userId || ranOnOpen.current) {
      return;
    }
    ranOnOpen.current = true;
    executionQueue.enqueueRunAll(getLayout(yDoc), getBlocks(yDoc), {
      _tag: "user",
      userId,
    });
  }, [isDashboard, syncing, userId, yDoc, executionQueue]);

  return isLive;
}
