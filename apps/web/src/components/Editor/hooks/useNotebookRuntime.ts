import type * as Y from "yjs";
import { useEffect, useRef, useSyncExternalStore } from "react";
import {
  BlockType,
  type ExecutionQueue,
  getBlocks,
  getLayout,
} from "@sandworm/editor";

import { toast } from "sonner";

import { DocumentRuntime } from "@/generated/graphql";
import type { Document } from "@/types";
import { DocExecutor } from "@/lib/browser-executor/doc-executor";
import { getKernelStatus, subscribeKernelStatus } from "@/lib/pyodide/kernel";

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

// A browser notebook runs on this machine, so a cell that eats memory can kill
// the tab or the whole computer, and then run again the moment the notebook is
// reopened. This marks a notebook as open and clears the mark when the page
// closes normally. A mark still there on the next open means the last session
// died, so that open doesn't run anything by itself.
const openMark = (notebookId: string) => `sandworm:browser-open:${notebookId}`;

function wasLeftOpen(notebookId: string): boolean {
  try {
    return window.localStorage.getItem(openMark(notebookId)) !== null;
  } catch {
    return false;
  }
}

function setOpenMark(notebookId: string, open: boolean) {
  try {
    if (open) {
      window.localStorage.setItem(openMark(notebookId), String(Date.now()));
    } else {
      window.localStorage.removeItem(openMark(notebookId));
    }
  } catch {
    // No storage: the notebook just runs as usual.
  }
}

// For a browser notebook: runs this user's queued cells in this tab, and runs
// the whole notebook every time it's opened or refreshed, and after Python is
// restarted, in the editor and in view mode alike, since browser Python starts
// empty each time. In view mode that's the only way it runs: there are no run
// buttons there.
// Returns whether the notebook runs in the browser.
export function useLiveNotebook(opts: {
  document: Pick<Document, "id" | "runtime">;
  yDoc: Y.Doc;
  executionQueue: ExecutionQueue;
  userId: string | null;
  syncing: boolean;
}): boolean {
  const { document, yDoc, executionQueue, userId, syncing } = opts;
  const isLive = isBrowserNotebook(document);

  useEffect(() => {
    if (!isLive) return undefined;
    const executor = new DocExecutor(yDoc, document.id, userId);
    executor.start();
    return () => {
      executor.stop();
    };
  }, [isLive, yDoc, document.id, userId]);

  // Whether the last session with this notebook ended without closing
  // properly (see openMark). Read once, before this session leaves its mark.
  const crashedLastTime = useRef<boolean | null>(null);
  useEffect(() => {
    if (!isLive) return undefined;
    crashedLastTime.current = wasLeftOpen(document.id);
    setOpenMark(document.id, true);
    const onClose = () => setOpenMark(document.id, false);
    window.addEventListener("pagehide", onClose);
    return () => {
      window.removeEventListener("pagehide", onClose);
      onClose();
    };
  }, [isLive, document.id]);

  // Runs on open, and again each time someone restarts Python, which leaves
  // it empty. Not after stopping a cell: that would start the cell again.
  const restarts = useSyncExternalStore(
    subscribeKernelStatus,
    () => getKernelStatus().restarts,
    () => 0
  );
  const ranFor = useRef<number | null>(null);
  useEffect(() => {
    if (!isLive || syncing || !userId || ranFor.current === restarts) {
      return;
    }
    ranFor.current = restarts;
    if (restarts === 0 && crashedLastTime.current) {
      toast.warning(
        "This notebook didn't run automatically: last time it was open, the page closed unexpectedly. Check its cells, then restart Python from the status pill to run it.",
        { duration: 15000 }
      );
      return;
    }
    executionQueue.enqueueRunAll(getLayout(yDoc), getBlocks(yDoc), {
      _tag: "user",
      userId,
    });
  }, [isLive, syncing, userId, yDoc, executionQueue, restarts]);

  return isLive;
}
