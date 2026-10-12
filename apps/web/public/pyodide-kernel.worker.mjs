// Pyodide kernel for notebooks that run in the browser. Served as a static
// module worker, outside the bundler: Pyodide refuses to start in a classic
// worker, which is what bundlers turn `new Worker(new URL(...))` into.
//
// The page drives it with the messages in src/lib/pyodide/protocol.ts, and
// sends the Python harness (src/lib/pyodide/harness.ts) with `init`.

const HOME = "/home/pyodide";
const SQL_PACKAGES = ["duckdb", "pandas", "jinja2"];
const MEMORY_REPORT_MS = 3000;

let kernel = null;
// Each notebook gets its own globals, so variables don't leak between them.
const namespaces = new Map();
// Calls run one at a time, in the order they arrive.
let chain = Promise.resolve();

function errorMessage(err) {
  return err instanceof Error ? err.message : String(err);
}

// The page reads the theme package and sends it with init: this worker's
// sandbox has an origin of its own and can't fetch the site's files.
function loadTheme(pyodide, files) {
  const dir = `${HOME}/sandworm_theme`;
  pyodide.FS.mkdirTree(dir);
  files.forEach(({ name, source }) => {
    pyodide.FS.writeFile(`${dir}/${name}`, source, { encoding: "utf8" });
  });
}

async function boot({ indexURL, theme, harness }) {
  const { loadPyodide } = await import(`${indexURL}pyodide.mjs`);
  const pyodide = await loadPyodide({ indexURL });
  pyodide.FS.mkdirTree(HOME);
  harness.modules.forEach(({ name, source }) => {
    pyodide.FS.writeFile(`${HOME}/${name}.py`, source, { encoding: "utf8" });
  });
  loadTheme(pyodide, theme);
  await pyodide.runPythonAsync(`
import sys

if "${HOME}" not in sys.path:
    sys.path.insert(0, "${HOME}")

import ${harness.runtimeModule}
`);

  const runtime = pyodide.pyimport(harness.runtimeModule);
  runtime.set_sink((notebookId, blockId, outputs) =>
    globalThis.postMessage({
      kind: "live_output",
      notebookId,
      blockId,
      outputs: JSON.parse(outputs),
    })
  );
  // Python's memory only ever grows, and a tab that runs out of it is killed
  // by the browser with everything in it. The page watches this number and
  // restarts Python before that happens (see kernel.ts).
  setInterval(() => {
    // eslint-disable-next-line no-underscore-dangle
    const bytes = pyodide._module?.HEAPU8?.length;
    if (typeof bytes === "number") {
      globalThis.postMessage({ kind: "memory", bytes });
    }
  }, MEMORY_REPORT_MS);

  return { pyodide, runtime };
}

function namespaceFor({ runtime }, notebookId) {
  let namespace = namespaces.get(notebookId);
  if (!namespace) {
    namespace = runtime.new_namespace();
    namespaces.set(notebookId, namespace);
  }
  return namespace;
}

// Browser Python can address 4 GB at the very most, and its memory only ever
// grows: a tab is in trouble long before that, and can take the machine with
// it. Past this ceiling live cells are stopped and nothing new runs until
// Python is restarted, which is the only thing that frees the memory.
const MEMORY_CEILING_BYTES = 1.5 * 1024 ** 3;
const MEMORY_CHECK_MS = 2000;

function memoryBytes(pyodide) {
  try {
    // eslint-disable-next-line no-underscore-dangle
    return pyodide._module.HEAPU8.length;
  } catch {
    return 0;
  }
}

function memoryLimitMessage(bytes) {
  return `Python is using ${(bytes / 1024 ** 3).toFixed(1)} GB, the most a browser notebook is allowed. Restart Python from the status pill to free it, and work with less data (or use a Cloud notebook).`;
}

// Live cells keep running between calls, so the ceiling is also checked on a
// timer: one that keeps growing is stopped before the tab runs out.
function watchMemory({ pyodide, runtime }) {
  setInterval(() => {
    const bytes = memoryBytes(pyodide);
    if (bytes >= MEMORY_CEILING_BYTES) {
      runtime.stop_all(memoryLimitMessage(bytes));
    }
  }, MEMORY_CHECK_MS);
}

async function handle(k, call) {
  const { pyodide, runtime } = k;
  if (call.kind === "reset") {
    runtime.stop_notebook(call.notebookId);
    namespaces.get(call.notebookId)?.destroy();
    namespaces.delete(call.notebookId);
    return null;
  }

  const ns = namespaceFor(k, call.notebookId);

  switch (call.kind) {
    case "run_python":
      if (memoryBytes(pyodide) >= MEMORY_CEILING_BYTES) {
        throw new Error(memoryLimitMessage(memoryBytes(pyodide)));
      }
      await pyodide.loadPackagesFromImports(call.code);
      await runtime.ensure_imports(call.code);
      return JSON.parse(
        await runtime.run(call.code, ns, call.notebookId, call.blockId)
      );
    case "run_sql":
      if (memoryBytes(pyodide) >= MEMORY_CEILING_BYTES) {
        throw new Error(memoryLimitMessage(memoryBytes(pyodide)));
      }
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
    case "get_variables":
      return JSON.parse(runtime.get_variables(JSON.stringify(call.names), ns));
    case "set_json_variable":
      runtime.set_json_variable(call.name, call.json, ns);
      return null;
    case "set_date_variable":
      await pyodide.loadPackage("pytz");
      runtime.set_date_variable(call.name, JSON.stringify(call.config), ns);
      return null;
    default:
      return null;
  }
}

globalThis.onmessage = event => {
  const message = event.data;

  if (message.kind === "init") {
    kernel = boot(message);
    kernel.then(watchMemory).catch(() => undefined);
    kernel.then(
      () => globalThis.postMessage({ kind: "ready" }),
      err =>
        globalThis.postMessage({ kind: "failed", error: errorMessage(err) })
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
    value => globalThis.postMessage({ kind: "result", id, value }),
    err =>
      globalThis.postMessage({ kind: "error", id, error: errorMessage(err) })
  );
};
