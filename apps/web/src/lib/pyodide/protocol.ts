import type { DataFrame, Output, RunQueryResult } from "@sandworm/types";

// Messages between the page and the Pyodide worker
// (public/pyodide-kernel.worker.mjs).

export type KernelCall =
  | { kind: "run_python"; notebookId: string; code: string }
  | { kind: "run_sql"; notebookId: string; sql: string; dataframeName: string }
  | {
      kind: "read_page";
      notebookId: string;
      dataframeName: string;
      page: number;
      sort: { column: string; order: "asc" | "desc" } | null;
    }
  | { kind: "list_dataframes"; notebookId: string }
  | { kind: "rename_variable"; notebookId: string; from: string; to: string }
  | { kind: "set_variable"; notebookId: string; name: string; value: string }
  | {
      kind: "set_date_variable";
      notebookId: string;
      name: string;
      config: unknown;
    }
  | { kind: "reset"; notebookId: string };

export type KernelResults = {
  run_python: Output[];
  run_sql: RunQueryResult;
  read_page: RunQueryResult;
  list_dataframes: DataFrame[];
  rename_variable: null;
  set_variable: null;
  set_date_variable: null;
  reset: null;
};

export type ToWorker =
  | {
      kind: "init";
      indexURL: string;
      origin: string;
      // Present when the page is cross-origin isolated: lets a running cell be
      // interrupted without losing the notebook's variables.
      interruptBuffer: Int32Array | null;
      // Python modules the worker installs before anything runs.
      harness: {
        runtimeModule: string;
        modules: { name: string; source: string }[];
      };
    }
  | { kind: "call"; id: number; call: KernelCall };

export type FromWorker =
  | { kind: "ready" }
  | { kind: "failed"; error: string }
  | { kind: "result"; id: number; value: unknown }
  | { kind: "error"; id: number; error: string };
