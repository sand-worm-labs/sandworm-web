/// <reference lib="webworker" />
// Runs Pyodide off the main thread, so a long cell never freezes the page and
// can be stopped by terminating this worker.

import type * as PyodideModule from "pyodide";
import type { PyodideInterface } from "pyodide";
import type { PyProxy } from "pyodide/ffi";

import {
  MPL_BACKEND_MODULE,
  MPL_BACKEND_SOURCE,
  RUNTIME_MODULE,
  RUNTIME_SOURCE,
} from "./harness";
import type { FromWorker, KernelCall, ToWorker } from "./protocol";

declare const self: DedicatedWorkerGlobalScope;

const HOME = "/home/pyodide";
const THEME_FILES = [
  "__init__.py",
  "html.py",
  "matplotlib_theme.py",
  "plotly_theme.py",
  "theme.py",
  "tokens.py",
  "watermark.py",
];

type Kernel = { pyodide: PyodideInterface; runtime: PyProxy };

let kernel: Promise<Kernel> | null = null;
// Each notebook gets its own globals, so variables don't leak between them.
const namespaces = new Map<string, PyProxy>();
// Calls run one at a time, in the order they arrive.
let chain: Promise<unknown> = Promise.resolve();

function post(message: FromWorker) {
  self.postMessage(message);
}

async function loadTheme(pyodide: PyodideInterface, origin: string) {
  const dir = `${HOME}/sandworm_theme`;
  pyodide.FS.mkdirTree(dir);
  await Promise.all(
    THEME_FILES.map(async file => {
      const response = await fetch(`${origin}/sandworm_theme/${file}`);
      if (!response.ok) {
        throw new Error(
          `Failed to load sandworm_theme/${file}: ${response.status}`
        );
      }
      pyodide.FS.writeFile(`${dir}/${file}`, await response.text(), {
        encoding: "utf8",
      });
    })
  );
}

async function boot(
  indexURL: string,
  origin: string,
  interruptBuffer: Int32Array | null
): Promise<Kernel> {
  // Loaded from the CDN at runtime rather than bundled.
  const { loadPyodide } = (await import(
    /* webpackIgnore: true */ /* turbopackIgnore: true */ `${indexURL}pyodide.mjs`
  )) as typeof PyodideModule;
  const pyodide = await loadPyodide({ indexURL });
  if (interruptBuffer) {
    pyodide.setInterruptBuffer(interruptBuffer);
  }

  pyodide.FS.mkdirTree(HOME);
  pyodide.FS.writeFile(`${HOME}/${RUNTIME_MODULE}.py`, RUNTIME_SOURCE, {
    encoding: "utf8",
  });
  pyodide.FS.writeFile(`${HOME}/${MPL_BACKEND_MODULE}.py`, MPL_BACKEND_SOURCE, {
    encoding: "utf8",
  });
  await loadTheme(pyodide, origin);
  await pyodide.runPythonAsync(`
import sys

if "${HOME}" not in sys.path:
    sys.path.insert(0, "${HOME}")

import ${RUNTIME_MODULE}
`);

  return { pyodide, runtime: pyodide.pyimport(RUNTIME_MODULE) };
}

function namespaceFor({ runtime }: Kernel, notebookId: string): PyProxy {
  let namespace = namespaces.get(notebookId);
  if (!namespace) {
    namespace = runtime.new_namespace() as PyProxy;
    namespaces.set(notebookId, namespace);
  }
  return namespace;
}

const SQL_PACKAGES = ["duckdb", "pandas", "jinja2"];

async function handle(k: Kernel, call: KernelCall): Promise<unknown> {
  const { pyodide, runtime } = k;
  if (call.kind === "reset") {
    namespaces.get(call.notebookId)?.destroy();
    namespaces.delete(call.notebookId);
    return null;
  }

  const ns = namespaceFor(k, call.notebookId);

  switch (call.kind) {
    case "run_python":
      await pyodide.loadPackagesFromImports(call.code);
      await runtime.ensure_imports(call.code);
      return JSON.parse(await runtime.run(call.code, ns));
    case "run_sql":
      await pyodide.loadPackage(SQL_PACKAGES);
      return JSON.parse(runtime.run_sql(call.sql, call.dataframeName, ns));
    case "read_page":
      await pyodide.loadPackage("pandas");
      return JSON.parse(
        runtime.read_page(
          call.dataframeName,
          call.page,
          call.sort ? JSON.stringify(call.sort) : "",
          ns
        )
      );
    case "list_dataframes":
      await pyodide.loadPackage("pandas");
      return JSON.parse(runtime.list_dataframes(ns));
    case "rename_variable":
      runtime.rename_variable(call.from, call.to, ns);
      return null;
    case "set_variable":
      runtime.set_variable(call.name, call.value, ns);
      return null;
    case "set_date_variable":
      await pyodide.loadPackage("pytz");
      runtime.set_date_variable(call.name, JSON.stringify(call.config), ns);
      return null;
    default:
      return null;
  }
}

self.onmessage = (event: MessageEvent<ToWorker>) => {
  const message = event.data;

  if (message.kind === "init") {
    kernel = boot(message.indexURL, message.origin, message.interruptBuffer);
    kernel.then(
      () => post({ kind: "ready" }),
      (err: unknown) =>
        post({
          kind: "failed",
          error: err instanceof Error ? err.message : String(err),
        })
    );
    return;
  }

  const { id, call } = message;
  const run = chain.then(async () => {
    if (!kernel) throw new Error("Python is not loaded");
    return handle(await kernel, call);
  });
  chain = run.catch(() => undefined);
  run.then(
    value => post({ kind: "result", id, value }),
    (err: unknown) =>
      post({
        kind: "error",
        id,
        error: err instanceof Error ? err.message : String(err),
      })
  );
};
