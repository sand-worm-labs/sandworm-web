import { useCallback, useSyncExternalStore } from "react";
import type { Output } from "@sandworm/types";

import {
  getLiveOutputs,
  subscribeLiveOutputs,
} from "@/lib/pyodide/liveOutputs";

// What a live cell (sandworm.every / sandworm.websocket) is showing right now,
// or null when the cell isn't live in this tab.
export function useLiveOutputs(blockId: string): Output[] | null {
  const subscribe = useCallback(
    (listener: () => void) => subscribeLiveOutputs(blockId, listener),
    [blockId]
  );
  const get = useCallback(() => getLiveOutputs(blockId), [blockId]);
  return useSyncExternalStore(subscribe, get, () => null);
}
