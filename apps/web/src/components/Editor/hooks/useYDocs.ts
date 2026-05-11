import * as Y from "yjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { YBlock } from "@sandworm/editor";
import {
  getBlocks,
  getDashboard,
  getLastUpdatedAt,
  getLayout,
  getMetadata,
  isDirty,
  setDirty,
  switchBlockType,
} from "@sandworm/editor";
import { LRUCache } from "lru-cache";
import type { EntityTable } from "dexie";
import Dexie from "dexie";

import { getDocId, useProvider } from "./useYProvider";
import useResettableState from "./useResettableState";
import { useReusableComponents } from "./useReusableComponents";

// =====================================
// ⬢ Database
// =====================================
const db = new Dexie("YjsDatabase") as Dexie & {
  yDocs: EntityTable<{ id: string; data: Uint8Array; clock: number }, "id">;
};

db.version(2).stores({
  yDocs: "id, data, clock",
});

// =====================================
// ⬢ Utils
// =====================================
function persistYDoc(id: string, yDoc: Y.Doc, clock: number) {
  const data = Y.encodeStateAsUpdate(yDoc);
  db.yDocs.put({ id, data, clock });
}

function restoreYDoc(
  id: string,
  clock: number
): [{ clock: number; yDoc: Y.Doc }, Promise<void>] {
  const yDoc = new Y.Doc();

  // ⬢ NOTE — Two-stage restore: returns the yDoc immediately for use,
  // then resolves the promise once IndexedDB data has been applied.
  // Callers should wait on the promise before treating the doc as ready.
  const restore = db.yDocs
    .get({ id, clock })
    .then(item => {
      if (item) {
        Y.applyUpdate(yDoc, item.data);
      }
    })
    .catch(async (dbErr: unknown) => {
      console.error("Failed to restore Y.Doc", dbErr);
      try {
        await db.yDocs.delete(id);
      } catch (deleteErr) {
        // ⬢ NOTE — If delete also fails we can't do much — log and move on.
        // The next cold restore will get a fresh doc.
        console.error("Failed to delete corrupt Y.Doc entry", deleteErr);
      }
    });

  return [{ yDoc, clock }, restore];
}

// =====================================
// ⬢ LRU Cache
// =====================================
// ⬢ NOTE — Max 10 docs in memory. On eviction the Y.Doc is destroyed
// to free observers and GC pressure. Increase if users frequently
// switch between more than 10 docs in a session.
const cache = new LRUCache<string, { clock: number; yDoc: Y.Doc }>({
  max: 10,
  dispose: ({ yDoc }) => {
    yDoc.destroy();
  },
});

// =====================================
// ⬢ Types
// =====================================
type GetYDocResult = {
  id: string;
  cached: boolean;
  yDoc: Y.Doc;
  clock: number;
  restore: Promise<void>;
};

// =====================================
// ⬢ getYDoc
// =====================================
function getYDoc(
  documentId: string,
  isDataApp: boolean,
  clock: number,
  publishedAt: string | null
): GetYDocResult {
  const id = getDocId(documentId, isDataApp, clock, publishedAt);

  let fromCache = cache.get(id);
  const cached = Boolean(fromCache);
  let restore = Promise.resolve();

  if (!fromCache) {
    // ⬢ NOTE — restoreYDoc returns a tuple: [docRef, restorePromise].
    // We cache the docRef immediately so concurrent callers get the same
    // instance, and await the promise separately in the hook.
    const [docRef, restorePromise] = restoreYDoc(id, clock);
    fromCache = docRef;
    restore = restorePromise;
    cache.set(id, fromCache);
  }

  return { id, cached, yDoc: fromCache.yDoc, clock: fromCache.clock, restore };
}

// =====================================
// ⬢ useYDocState
// =====================================
// ⬢ NOTE — Generic hook for subscribing to any Y.AbstractType inside a doc.
// Re-renders the consumer whenever the observed subtree changes.
export function useYDocState<T extends Y.AbstractType<any>>(
  yDoc: Y.Doc,
  getter: (doc: Y.Doc) => T
) {
  const [state, setState] = useResettableState<{ value: T }>(
    () => ({ value: getter(yDoc) }),
    [yDoc]
  );

  useEffect(() => {
    const onUpdate = () => {
      setState({ value: getter(yDoc) });
    };

    state.value.observeDeep(onUpdate);

    return () => {
      state.value.unobserveDeep(onUpdate);
    };
  }, [yDoc, state.value, getter, setState]);

  return { yDoc, state };
}

// =====================================
// ⬢ useYDoc
// =====================================
export function useYDoc(
  workspaceId: string,
  documentId: string,
  isDataApp: boolean,
  clock: number,
  userId: string | null,
  publishedAt: string | null,
  connect: boolean,
  initialState: Buffer | null
) {
  const isFirst = useRef(true);

  console.log("get doc", isDataApp, clock, userId, publishedAt, connect);
  const [{ id, cached, yDoc, restore }, setYDoc] = useState(() =>
    getYDoc(documentId, isDataApp, clock, publishedAt)
  );
  const [restoring, setRestoring] = useResettableState(() => true, [restore]);

  const metadata = useYDocState(yDoc, getMetadata);
  const provider = useProvider(
    yDoc,
    documentId,
    isDataApp,
    clock,
    userId,
    publishedAt
  );
  const [syncing, setSyncing] = useResettableState(() => true, [provider]);

  const [, { removeInstance: removeComponentInstance }] =
    useReusableComponents(workspaceId);

  useEffect(() => {
    restore
      .then(() => setRestoring(false))
      .catch(() => {
        // ⬢ NOTE — restoreYDoc handles its own errors internally, but if anything
        // slips through we still need to clear restoring state so the UI
        // does not hang indefinitely on the loading screen.
        setRestoring(false);
      });
  }, [restore, setRestoring]);

  // Swap Y.Doc when documentId/clock/publishedAt change, persist on unmount
  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return () => {
        persistYDoc(id, yDoc, clock);
      };
    }

    const next = getYDoc(documentId, isDataApp, clock, publishedAt);
    setYDoc(next);
    return () => {
      persistYDoc(next.id, next.yDoc, next.clock);
    };
  }, [documentId, isDataApp, clock, publishedAt, userId]);

  useEffect(() => {
    const onSynced = (synced: boolean) => {
      setSyncing(!synced);
    };

    provider.onSynced(onSynced);

    return () => {
      provider.offSynced(onSynced);
    };
  }, [provider, setSyncing]);

  useEffect(() => {
    if (syncing) return;

    const blocks = getBlocks(yDoc);
    const layout = getLayout(yDoc);
    const dashboard = getDashboard(yDoc);

    console.log("[YDoc Content]", {
      mode: isDataApp ? "VIEW" : "EDIT",
      documentId,
      blockCount: blocks.size,
      blocks: Array.from(blocks.entries()).map(([id, block]) => ({
        id,
        type: block.get("type") as string,
      })),
      layoutSize: layout.length,
      dashboardSize: dashboard.size,
    });
  }, [syncing, yDoc, documentId, isDataApp]);

  useEffect(() => {
    if (initialState) {
      Y.applyUpdate(yDoc, initialState);
    }
  }, [initialState, yDoc]);

  useEffect(() => {
    if (connect) {
      provider.connect();
    }

    return () => {
      // ⬢ NOTE — Only destroy if we actually connected. Destroying a provider
      // that was never connected may tear down shared internal state prematurely.
      if (connect) {
        provider.destroy();
      }
    };
  }, [provider, connect]);

  useEffect(() => {
    if (syncing) {
      console.time(`${documentId} sync`);
      return () => {};
    }

    console.timeEnd(`${documentId} sync`);
    console.log(`${documentId} not syncing`, new Date().toISOString());

    // ⬢ NOTE — consistent-return: both branches must return void or a cleanup.
    // The syncing branch returns undefined (no cleanup needed while still syncing).
    // The synced branch returns the cleanup for the update listener.
    const onUpdate = (
      _update: Uint8Array,
      _origin: unknown,
      doc: Y.Doc,
      tr: Y.Transaction
    ) => {
      if (syncing || !tr.local) {
        return;
      }

      if (!isDirty(doc)) {
        setDirty(doc);
      }
    };

    yDoc.on("update", onUpdate);

    return () => {
      yDoc.off("update", onUpdate);
    };
  }, [yDoc, syncing, documentId]);

  // Observe block map for component instance cleanup on block delete
  useEffect(() => {
    const blocks = getBlocks(yDoc);

    // ⬢ NOTE — Tracks blockId → componentId so we can call removeComponentInstance
    // when a block is deleted. Must stay in sync with block additions/updates.
    // ⚠ HACK — componentMap is recreated on every effect re-run (when yDoc or
    // removeComponentInstance identity changes). If removeComponentInstance becomes
    // unstable this map will reset mid-session and miss delete events between
    // teardown and re-population. Consider useRef if this becomes a problem.
    const componentMap = new Map<string, string>();

    const updateComponentMap = (blockId: string) => {
      const block = blocks.get(blockId);
      if (!block) return;

      const componentId = switchBlockType(block, {
        onSQL: sqlBlock => sqlBlock.getAttribute("componentId"),
        onPython: pyBlock => pyBlock.getAttribute("componentId"),
        onRichText: () => null,
        onVisualization: () => null,
        onVisualizationV2: () => null,
        onInput: () => null,
        onDropdownInput: () => null,
        onDateInput: () => null,
        onFileUpload: () => null,
        onDashboardHeader: () => null,
        onPivotTable: () => null,
        onPowerToolbox: () => null,
        onMarkdown: ()=> null
      });

      if (componentId) {
        componentMap.set(blockId, componentId);
      }
    };

    Array.from(blocks.keys()).forEach(blockId => {
      updateComponentMap(blockId);
    });

    const onBlocksUpdate = (evt: Y.YMapEvent<YBlock>) => {
      Array.from(evt.changes.keys.entries()).forEach(
        ([blockId, { action }]) => {
          if (action === "add" || action === "update") {
            updateComponentMap(blockId);
          } else if (action === "delete") {
            const componentId = componentMap.get(blockId);
            if (componentId) {
              componentMap.delete(blockId);
              removeComponentInstance(workspaceId, componentId, blockId);
            }
          }
        }
      );
    };

    blocks.observe(onBlocksUpdate);

    return () => {
      blocks.unobserve(onBlocksUpdate);
    };
  }, [yDoc, workspaceId, removeComponentInstance]);

  const undoManager = useMemo(
    () =>
      new Y.UndoManager([getLayout(yDoc), getBlocks(yDoc), getDashboard(yDoc)]),
    [yDoc]
  );

  const undo = useCallback(() => {
    undoManager.undo();
  }, [undoManager]);

  const redo = useCallback(() => {
    undoManager.redo();
  }, [undoManager]);

  return {
    yDoc,
    provider,
    syncing: (syncing || restoring) && !cached,
    isDirty: metadata.state.value.getAttribute("isDirty") ?? false,
    undo,
    redo,
  };
}

// =====================================
// ⬢ useLastUpdatedAt
// =====================================
export function useLastUpdatedAt(yDoc: Y.Doc): string | null {
  const [lastUpdatedAt, setLastUpdatedAt] = useResettableState<string | null>(
    () => getLastUpdatedAt(yDoc),
    [yDoc]
  );

  useEffect(() => {
    const onUpdate = () => {
      setLastUpdatedAt(getLastUpdatedAt(yDoc));
    };

    yDoc.on("update", onUpdate);

    return () => {
      yDoc.off("update", onUpdate);
    };
  }, [yDoc, setLastUpdatedAt]);

  return lastUpdatedAt;
}
