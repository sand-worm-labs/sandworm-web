import pyodidePackage from "pyodide/package.json";
import { toast } from "sonner";

import {
  MPL_BACKEND_MODULE,
  MPL_BACKEND_SOURCE,
  RUNTIME_MODULE,
  RUNTIME_SOURCE,
  SANDWORM_MODULE,
  SANDWORM_SOURCE,
} from "./harness";
import { clearAllLiveOutputs, setLiveOutputs } from "./liveOutputs";
import type {
  FromWorker,
  KernelCall,
  KernelResults,
  ToWorker,
} from "./protocol";

// The page's handle on the Pyodide worker: one interpreter shared by every
// Live notebook open in this tab.

export type KernelStatus = "off" | "loading" | "ready" | "failed";

// The JS loader and the wasm/stdlib it fetches must be the same release.
const INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${pyodidePackage.version}/full/`;

type Pending = {
  resolve: (value: unknown) => void;
  reject: (err: Error) => void;
};

let worker: Worker | null = null;
let interruptBuffer: Int32Array | null = null;
let status: KernelStatus = "off";
let statusError: string | null = null;
// When the current interpreter came up. Cells that last ran before this have
// nothing in memory, so running a later cell re-runs them first.
let startedAt: string | null = null;
// How many times someone has restarted Python in this tab. A restart empties
// every notebook's variables, so open browser notebooks run again.
let restarts = 0;
export type KernelSnapshot = {
  status: KernelStatus;
  error: string | null;
  startedAt: string | null;
  restarts: number;
};
let snapshot: KernelSnapshot = {
  status,
  error: statusError,
  startedAt,
  restarts,
};
let nextId = 0;
const pending = new Map<number, Pending>();
const listeners = new Set<() => void>();

function setStatus(next: KernelStatus, error: string | null = null) {
  status = next;
  statusError = error;
  if (next === "ready") startedAt = new Date().toISOString();
  snapshot = { status, error: statusError, startedAt, restarts };
  listeners.forEach(l => l());
}

// Stable between changes, for useSyncExternalStore.
export function getKernelStatus(): KernelSnapshot {
  return snapshot;
}

export function subscribeKernelStatus(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function failPending(reason: string) {
  pending.forEach(p => p.reject(new Error(reason)));
  pending.clear();
}

function start(): Worker {
  if (worker) return worker;

  // Interrupting a running cell needs SharedArrayBuffer, which browsers only
  // allow on cross-origin isolated pages. Without it, stopping restarts Python.
  interruptBuffer =
    typeof SharedArrayBuffer !== "undefined" && globalThis.crossOriginIsolated
      ? new Int32Array(new SharedArrayBuffer(4))
      : null;

  // A static file rather than a bundled worker: bundlers emit classic
  // workers, and Pyodide only runs in module workers.
  const w = new Worker("/pyodide-kernel.worker.mjs", { type: "module" });
  w.onmessage = (event: MessageEvent<FromWorker>) => {
    const message = event.data;
    switch (message.kind) {
      case "ready":
        setStatus("ready");
        break;
      case "failed":
        setStatus("failed", message.error);
        failPending(message.error);
        break;
      case "result":
        pending.get(message.id)?.resolve(message.value);
        pending.delete(message.id);
        break;
      case "error":
        pending.get(message.id)?.reject(new Error(message.error));
        pending.delete(message.id);
        break;
      case "live_output":
        setLiveOutputs(message.blockId, message.outputs);
        notifyNotebookChanged(message.notebookId);
        break;
      case "memory":
        checkMemory(message.bytes);
        break;
      default:
        break;
    }
  };
  w.onerror = event => {
    setStatus("failed", event.message || "Python crashed");
    failPending("Python crashed");
  };

  const init: ToWorker = {
    kind: "init",
    indexURL: INDEX_URL,
    origin: globalThis.location.origin,
    interruptBuffer,
    harness: {
      runtimeModule: RUNTIME_MODULE,
      modules: [
        { name: RUNTIME_MODULE, source: RUNTIME_SOURCE },
        { name: MPL_BACKEND_MODULE, source: MPL_BACKEND_SOURCE },
        { name: SANDWORM_MODULE, source: SANDWORM_SOURCE },
      ],
    },
  };
  w.postMessage(init);
  worker = w;
  setStatus("loading");
  return w;
}

// Starts Python in the background, so it's warm by the first run.
export function warmUpKernel() {
  start();
}

// ── Variable changes ─────────────────────────────────────────────────────────
// JavaScript cells follow the notebook's Python variables. Nothing says which
// variable a cell or a live tick changed, so listeners are told the notebook
// changed and read again what they care about.
const CHANGES_VARIABLES = new Set<KernelCall["kind"]>([
  "run_python",
  "run_sql",
  "rename_variable",
  "set_variable",
  "set_json_variable",
  "set_date_variable",
  "reset",
]);
const changeListeners = new Map<string, Set<() => void>>();

function notifyNotebookChanged(notebookId: string) {
  changeListeners.get(notebookId)?.forEach(l => l());
}

export function subscribeNotebookChanges(
  notebookId: string,
  listener: () => void
): () => void {
  let set = changeListeners.get(notebookId);
  if (!set) {
    set = new Set();
    changeListeners.set(notebookId, set);
  }
  set.add(listener);
  return () => {
    set.delete(listener);
    if (set.size === 0) changeListeners.delete(notebookId);
  };
}

export function callKernel<K extends KernelCall["kind"]>(
  call: Extract<KernelCall, { kind: K }>
): Promise<KernelResults[K]> {
  const w = start();
  const id = nextId;
  nextId += 1;
  return new Promise((resolve, reject) => {
    pending.set(id, {
      resolve: value => resolve(value as KernelResults[K]),
      reject,
    });
    const message: ToWorker = { kind: "call", id, call };
    w.postMessage(message);
  }).then(value => {
    if (CHANGES_VARIABLES.has(call.kind))
      notifyNotebookChanged(call.notebookId);
    return value as KernelResults[K];
  });
}

// ── Memory guard ─────────────────────────────────────────────────────────────
// Python's memory never shrinks while it runs, and a tab that uses too much is
// killed by the browser, taking the page with it. Past the limit, everything
// is stopped and Python starts again, which runs the open notebooks afresh.
// A notebook that goes over again straight away would restart forever, so the
// second time in a row Python is left stopped-and-empty instead.
const GIGABYTE = 1024 ** 3;
const MEMORY_LOOP_WINDOW_MS = 2 * 60 * 1000;
let lastMemoryRestart = 0;

// A quarter of the device's memory, between 512 MB and 2 GB. Browsers only
// report device memory roughly, and some not at all.
function memoryLimit(): number {
  const deviceGb =
    (globalThis.navigator as { deviceMemory?: number } | undefined)
      ?.deviceMemory ?? 4;
  return Math.min(2, Math.max(0.5, deviceGb / 4)) * GIGABYTE;
}

function checkMemory(bytes: number) {
  if (bytes < memoryLimit()) return;

  const megabytes = Math.round(bytes / 1024 ** 2);
  const again = Date.now() - lastMemoryRestart < MEMORY_LOOP_WINDOW_MS;
  lastMemoryRestart = Date.now();
  if (again) {
    replaceWorker();
    toast.error(
      `Python used too much memory again (${megabytes} MB) and was stopped. Keep less data in memory, then run the notebook.`
    );
    return;
  }
  toast.warning(
    `Python used too much memory (${megabytes} MB), so the notebook was restarted.`
  );
  restartKernel();
}

// Throws away the interpreter and every notebook's variables.
function replaceWorker() {
  worker?.terminate();
  worker = null;
  failPending("Python was restarted");
  clearAllLiveOutputs();
  start();
}

// A restart someone asked for: open browser notebooks run again afterwards.
export function restartKernel() {
  restarts += 1;
  replaceWorker();
}

// Stops the running cell. Keeps variables when the page allows interrupts;
// otherwise the only way to stop Python is to restart it.
export function interruptKernel(): "interrupted" | "restarted" {
  if (interruptBuffer) {
    // 2 is SIGINT: Python raises KeyboardInterrupt in the running cell.
    Atomics.store(interruptBuffer, 0, 2);
    return "interrupted";
  }
  // Not counted as a restart: re-running the notebook would start the very
  // cell that was just stopped.
  replaceWorker();
  return "restarted";
}
