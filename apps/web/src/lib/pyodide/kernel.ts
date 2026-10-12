import pyodidePackage from "pyodide/package.json";

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
export type KernelSnapshot = {
  status: KernelStatus;
  error: string | null;
  startedAt: string | null;
};
let snapshot: KernelSnapshot = { status, error: statusError, startedAt };
let nextId = 0;
const pending = new Map<number, Pending>();
const listeners = new Set<() => void>();

function setStatus(next: KernelStatus, error: string | null = null) {
  status = next;
  statusError = error;
  if (next === "ready") startedAt = new Date().toISOString();
  snapshot = { status, error: statusError, startedAt };
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

// Live cells stop polling while nobody can see them.
function sendVisibility() {
  const message: ToWorker = { kind: "visibility", hidden: document.hidden };
  worker?.postMessage(message);
}

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", sendVisibility);
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
  if (globalThis.document?.hidden) {
    sendVisibility();
  }
  setStatus("loading");
  return w;
}

// Starts Python in the background, so it's warm by the first run.
export function warmUpKernel() {
  start();
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
  });
}

// Throws away the interpreter and every notebook's variables.
export function restartKernel() {
  worker?.terminate();
  worker = null;
  failPending("Python was restarted");
  clearAllLiveOutputs();
  start();
}

// Stops the running cell. Keeps variables when the page allows interrupts;
// otherwise the only way to stop Python is to restart it.
export function interruptKernel(): "interrupted" | "restarted" {
  if (interruptBuffer) {
    // 2 is SIGINT: Python raises KeyboardInterrupt in the running cell.
    Atomics.store(interruptBuffer, 0, 2);
    return "interrupted";
  }
  restartKernel();
  return "restarted";
}
