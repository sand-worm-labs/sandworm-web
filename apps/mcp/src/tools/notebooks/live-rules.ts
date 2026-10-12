// What an agent needs to know to build a notebook that keeps updating after
// it opens. All of it is for browser notebooks (live_dashboard,
// local_analysis) only: appended to the cell tools' descriptions.

// The `sandworm` Python module, preinstalled in browser notebooks. Mirrors
// apps/web/src/lib/pyodide/harness.ts.
export const LIVE_PYTHON_GUIDANCE = [
  'Live cells (browser notebooks only: live_dashboard, local_analysis). `import sandworm as sw` is preinstalled there and does not exist in a cloud notebook.',
  'Polling: decorate a function with `@sw.every(seconds)` (0.5 or more). It runs once as part of the cell, then again every `seconds`; whatever it returns (a chart, a DataFrame, text) replaces the cell\'s output each time, and what it prints is shown above it. It may be `async` and `await` a request. One `@sw.every` function per chart cell.',
  'HTTP from the browser: `from pyodide.http import pyfetch`, then `r = await pyfetch(url); data = await r.json()`. `requests` does not work. Only APIs that allow browser (CORS) requests and need no secret key: there are no workspace API keys in a browser notebook.',
  'WebSockets: `sw.websocket(url, on_message, subscribe=None)` opens a socket that reconnects by itself and calls `on_message` with each message, parsed as JSON when it can be; `subscribe` is a message (or list of messages) sent on every connect. Keep what arrives in a bounded list or array (e.g. `del rows[:-5000]`), and draw it from a separate `@sw.every(1)` function: never redraw on every message.',
  'Charts that update: return `sw.stream(x, y, title=..., kind="line")` for a time series. `x` is times as epoch milliseconds or datetimes, `y` one series or a dict of name -> series; kind is "line", "area" or "bars"; `window=` sets how many seconds to show. It scrolls smoothly between updates. For anything else that updates every second (ranked bars, a donut, a heatmap) return `sw.plot(traces, layout)`: plain Plotly traces and layout as dicts, with no plotly import. Plotly Express and `go.Figure` work too but are slow to rebuild, so use them for charts that update every 10 seconds or less often.',
  'Structure of a live dashboard: one "engine" cell that fetches or receives the data and keeps small rolling tables in module-level variables (numpy arrays, or a short list of rows), then one small cell per chart that reads those variables. Later cells share the earlier cells\' variables. Summarise each new batch as it arrives and keep the summaries; do not rescan all history on every tick.',
  'Limits, so it runs on every device: keep under about 100 MB of data in memory and 5,000 to 10,000 new rows a second; a tick should take well under its interval; a chart should draw a few thousand points at most. Python that uses too much memory is restarted. Re-running a cell stops the pollers and sockets it started, so it is safe to run again.',
  'A cell with `@sw.every` or `sw.websocket` keeps running while the notebook is open, including in a background tab. Do not write `while True` loops or `time.sleep`: use `@sw.every`.',
].join(' ');

// The JavaScript cell. Mirrors the frame the web app runs it in
// (apps/web/src/components/Editor/blocks/customBlocks/javascript).
export const JAVASCRIPT_GUIDANCE = [
  'JavaScript cells (type "javascript"; browser notebooks only: adding one to a cloud notebook is refused, and a notebook that has one cannot be changed to cloud). Use one when a JavaScript library draws something Python cannot do well: a candlestick chart, a custom interactive visual, a map.',
  'The cell\'s content is an ES module that runs in a sandboxed frame in the reader\'s browser each time the notebook opens: top-level `await` works, and it has no access to the app, cookies or storage. Import libraries by full URL with the version pinned, from esm.sh: `import { createChart } from "https://esm.sh/lightweight-charts@4.2.0"`. No bare imports (`from "d3"`), no npm install, no JSX or TypeScript.',
  'Draw into `sw.root`, the cell\'s output element (empty, full width; set its height or let the content size it). `sw.theme` is "light" or "dark" and `sw.colors` has `ink`, `muted`, `rule` and `series` (an array of chart colors): use them instead of hard-coded colors so the cell reads in both themes.',
  'Data from Python: `const rows = await sw.get("name")` reads a Python variable once; `sw.watch("name", rows => { ... })` calls back now and again every time it changes, which is how a JavaScript chart follows a live Python cell. A DataFrame arrives as an array of row objects, arrays and Series as arrays, dates as ISO strings, NaN as null; a variable that is not defined arrives as undefined. Keep what crosses small: aggregate in Python and send what the chart draws, not raw rows.',
  'Data to Python: `await sw.set("name", value)` stores a JSON value (a selection, a filter) in a Python variable that later Python cells and `@sw.every` functions can read.',
  'Put the JavaScript cell after the Python cells whose variables it reads. A JavaScript cell has no stored result: it draws when the notebook is open.',
].join(' ');
