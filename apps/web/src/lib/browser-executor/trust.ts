import { useCallback, useSyncExternalStore } from "react";

// =====================================
// ⬢ Whose code runs
// =====================================
// A browser notebook's code runs on the machine of whoever opens it. It runs
// in a sandbox that keeps it away from their session (see
// lib/pyodide/sandbox.ts), but it can still use their CPU and memory, call
// out to the network, and draw whatever it likes inside the notebook. So a
// notebook someone else wrote doesn't start by itself: the reader is asked
// first. Their own notebooks run as before.
//
// Kept for this page only. A notebook's code can change between visits, so an
// earlier yes says nothing about what would run this time.

// Notebooks this reader wrote.
const own = new Set<string>();
// Notebooks whose code may run in this tab: the reader's own, and the ones
// they said yes to or ran themselves.
const trusted = new Set<string>();
const listeners = new Set<() => void>();

const changed = () => listeners.forEach(l => l());

export function setNotebookOwner(notebookId: string, isOwn: boolean) {
  if (isOwn === own.has(notebookId) && (!isOwn || trusted.has(notebookId))) {
    return;
  }
  if (isOwn) {
    own.add(notebookId);
    trusted.add(notebookId);
  } else {
    own.delete(notebookId);
  }
  changed();
}

export function trustNotebook(notebookId: string) {
  if (trusted.has(notebookId)) return;
  trusted.add(notebookId);
  changed();
}

export const isNotebookTrusted = (notebookId: string) =>
  trusted.has(notebookId);

export const isOwnNotebook = (notebookId: string) => own.has(notebookId);

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Whether this notebook's code may run in this tab.
export function useNotebookTrusted(notebookId: string): boolean {
  const get = useCallback(() => trusted.has(notebookId), [notebookId]);
  return useSyncExternalStore(subscribe, get, () => false);
}

// Whether the reader wrote this notebook. False until that is known.
export function useIsOwnNotebook(notebookId: string): boolean {
  const get = useCallback(() => own.has(notebookId), [notebookId]);
  return useSyncExternalStore(subscribe, get, () => false);
}
