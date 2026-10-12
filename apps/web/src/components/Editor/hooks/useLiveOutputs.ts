import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import type { Output } from "@sandworm/types";

import {
  getLiveOutputs,
  subscribeLiveOutputs,
} from "@/lib/pyodide/liveOutputs";

const noSubscription = () => () => {};

// What a live cell (sandworm.every / sandworm.websocket) is showing right now,
// or null when the cell isn't live in this tab.
//
// While the cell is scrolled out of view (onScreen false) it keeps the output
// it last had and stops following updates: redrawing charts nobody can see is
// what makes a dashboard of many live cells slow.
export function useLiveOutputs(
  blockId: string,
  onScreen = true
): Output[] | null {
  const held = useRef<{ blockId: string; outputs: Output[] | null }>({
    blockId,
    outputs: null,
  });
  const subscribe = useCallback(
    (listener: () => void) => subscribeLiveOutputs(blockId, listener),
    [blockId]
  );
  const get = useCallback(() => {
    if (onScreen || held.current.blockId !== blockId) {
      held.current = { blockId, outputs: getLiveOutputs(blockId) };
    }
    return held.current.outputs;
  }, [blockId, onScreen]);
  return useSyncExternalStore(
    onScreen ? subscribe : noSubscription,
    get,
    () => null
  );
}

// Whether an element is on screen, or close enough that it's about to be.
// Returns a ref to put on the element. True until the browser says otherwise,
// so nothing waits on the first measurement.
export function useOnScreen<T extends Element>(): [
  (element: T | null) => void,
  boolean,
] {
  const [onScreen, setOnScreen] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  const ref = useCallback((element: T | null) => {
    observer.current?.disconnect();
    observer.current = null;
    if (!element || typeof IntersectionObserver === "undefined") {
      setOnScreen(true);
      return;
    }
    observer.current = new IntersectionObserver(
      entries => {
        const entry = entries[entries.length - 1];
        if (entry) setOnScreen(entry.isIntersecting);
      },
      { rootMargin: "200px" }
    );
    observer.current.observe(element);
  }, []);

  return [ref, onScreen];
}
