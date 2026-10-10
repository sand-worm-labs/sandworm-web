import type * as Y from "yjs";
import { useEffect, useRef } from "react";
import { type ExecutionQueue, getBlocks, getLayout } from "@sandworm/editor";

import { DocumentRuntime } from "@/generated/graphql";
import type { Document } from "@/types";
import { DocExecutor } from "@/lib/browser-executor/doc-executor";

// Two kinds of notebook run in the browser, never on the cloud: light
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

// For a browser notebook: runs this user's queued cells in this tab. A live
// dashboard also runs in full when someone opens its published view, so each
// viewer sees fresh results. Returns whether the notebook runs in the browser.
export function useLiveNotebook(opts: {
  document: Pick<Document, "id" | "runtime">;
  yDoc: Y.Doc;
  executionQueue: ExecutionQueue;
  userId: string | null;
  syncing: boolean;
  runOnOpen: boolean;
}): boolean {
  const { document, yDoc, executionQueue, userId, syncing, runOnOpen } = opts;
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
    if (!isDashboard || !runOnOpen || syncing || !userId || ranOnOpen.current) {
      return;
    }
    ranOnOpen.current = true;
    executionQueue.enqueueRunAll(getLayout(yDoc), getBlocks(yDoc), {
      _tag: "user",
      userId,
    });
  }, [isDashboard, runOnOpen, syncing, userId, yDoc, executionQueue]);

  return isLive;
}
