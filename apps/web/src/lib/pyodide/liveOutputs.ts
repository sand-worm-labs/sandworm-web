import type { Output } from "@sandworm/types";

// The latest output of each live cell (sandworm.every / sandworm.websocket),
// by block id. Kept on this page only: live updates would flood the shared
// notebook, which keeps the snapshot from the cell's own run instead.

const outputs = new Map<string, Output[]>();
const listeners = new Map<string, Set<() => void>>();

function notify(blockId: string) {
  listeners.get(blockId)?.forEach(l => l());
}

export function setLiveOutputs(blockId: string, value: Output[]) {
  outputs.set(blockId, value);
  notify(blockId);
}

export function clearLiveOutputs(blockId: string) {
  if (outputs.delete(blockId)) notify(blockId);
}

export function clearAllLiveOutputs() {
  const blockIds = Array.from(outputs.keys());
  outputs.clear();
  blockIds.forEach(notify);
}

export function getLiveOutputs(blockId: string): Output[] | null {
  return outputs.get(blockId) ?? null;
}

export function subscribeLiveOutputs(
  blockId: string,
  listener: () => void
): () => void {
  let set = listeners.get(blockId);
  if (!set) {
    set = new Set();
    listeners.set(blockId, set);
  }
  set.add(listener);
  return () => {
    set.delete(listener);
    if (set.size === 0) listeners.delete(blockId);
  };
}
