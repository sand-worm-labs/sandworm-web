// Python modules written into Pyodide's filesystem at startup. They turn a
// cell run into the same Output[] the cloud kernel produces (see
// apps/api/.../jupyter-session/iopub-decoder.ts), so results render and sync
// identically whichever runtime made them.

export const RUNTIME_MODULE = "_sandworm_runtime";
export const MPL_BACKEND_MODULE = "_sandworm_mpl_backend";
export const SANDWORM_MODULE = "sandworm";

export const RUNTIME_SOURCE = String.raw`
import asyncio
import base64
import contextvars
import importlib.util
import inspect
import io
import json
import os
import sys
import traceback
import types

# Must be set before matplotlib is first imported.
os.environ["MPLBACKEND"] = "module://${MPL_BACKEND_MODULE}"

CELL_FILENAME = "<cell>"

# Import name -> PyPI name, for packages micropip has to fetch.
PYPI_NAMES = {
    "sklearn": "scikit-learn",
    "bs4": "beautifulsoup4",
    "yaml": "pyyaml",
    "PIL": "pillow",
    "IPython": "ipython",
}

# Where output goes right now: the running cell's list, or a live tick's.
# A context variable, because live ticks run as asyncio tasks alongside cells.
_current = contextvars.ContextVar("sandworm_outputs", default=None)


def _emit(output):
    outputs = _current.get()
    if outputs is not None:
        outputs.append(output)


# Everything a cell shows is copied to the page and drawn there, so an output
# the browser can't hold takes the tab (and sometimes the machine) down with
# it. A live cell sends its output again on every tick, so its limit is lower.
MAX_RESULT_BYTES = 25 * 1024 * 1024
MAX_LIVE_BYTES = 2 * 1024 * 1024


def _serialize(outputs, limit, what):
    """JSON for the page, or an error output in its place when it's too big."""
    text = json.dumps(outputs, default=str)
    if len(text) <= limit:
        return text
    return json.dumps([{
        "type": "error",
        "ename": "OutputTooLarge",
        "evalue": (
            f"{what} is {len(text) / 1024 / 1024:.1f} MB, over the {limit / 1024 / 1024:.0f} MB "
            "a browser notebook can show. Plot fewer points (aggregate or sample the data), "
            "or use a Cloud notebook for heavy output."
        ),
        "traceback": [],
    }])


def _is_too_large(text):
    return text.startswith('[{"type": "error", "ename": "OutputTooLarge"')


class _Stream(io.TextIOBase):
    def __init__(self, name, fallback):
        self._name = name
        self._fallback = fallback

    def writable(self):
        return True

    def write(self, text):
        if not text:
            return 0
        outputs = _current.get()
        if outputs is None:
            # Outside any cell, e.g. a WebSocket callback: the browser console.
            return self._fallback.write(text)
        last = outputs[-1] if outputs else None
        if last and last["type"] == "stdio" and last["name"] == self._name:
            last["text"] += text
        else:
            _emit({"type": "stdio", "name": self._name, "text": text})
        return len(text)


sys.stdout = _Stream("stdout", sys.stdout)
sys.stderr = _Stream("stderr", sys.stderr)


def _figure_png(fig):
    buf = io.BytesIO()
    fig.savefig(buf, format="png", bbox_inches="tight")
    return base64.b64encode(buf.getvalue()).decode("ascii")


def flush_figures():
    """Emit every open matplotlib figure, like IPython's inline backend."""
    if "matplotlib.pyplot" not in sys.modules:
        return
    import matplotlib.pyplot as plt

    for num in plt.get_fignums():
        _emit({"type": "image", "format": "png", "data": _figure_png(plt.figure(num))})
    plt.close("all")


def _repr(obj, method):
    fn = getattr(obj, method, None)
    if fn is None or isinstance(obj, type):
        return None
    try:
        value = fn()
    except Exception:
        return None
    if isinstance(value, tuple):
        value = value[0]
    return value


class Plot:
    """A chart given as plain plotly data and layout: what sandworm.plot() makes.

    Skips the plotly library, whose figures take long enough to build and
    validate that a dashboard of live charts spends its time there.
    """

    def __init__(self, data, layout=None):
        self.data = data if isinstance(data, (list, tuple)) else [data]
        self.layout = layout or {}


def _plain(value):
    """Turn arrays, Series and dates into what JSON can carry."""
    import datetime
    import math

    if isinstance(value, dict):
        return {str(k): _plain(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [_plain(v) for v in value]
    if isinstance(value, float):
        return value if math.isfinite(value) else None
    if isinstance(value, (str, int, bool)) or value is None:
        return value
    if isinstance(value, (datetime.datetime, datetime.date)):
        return value.isoformat()
    if "numpy" in sys.modules:
        import numpy as np

        if hasattr(value, "to_numpy"):  # pandas Series and Index
            value = value.to_numpy()
        if isinstance(value, np.ndarray):
            if value.dtype.kind == "M":
                return np.datetime_as_string(value, unit="ms").tolist()
            if value.dtype.kind == "f" and not np.isfinite(value).all():
                return _plain(value.tolist())
            if value.dtype.kind in "biuf":
                return value.tolist()
            return _plain(value.tolist())
        if isinstance(value, np.generic):
            return _plain(value.item())
    return str(value)


def _display_one(obj):
    if obj is None:
        return
    module = type(obj).__module__ or ""

    if isinstance(obj, Plot):
        _emit({"type": "plotly", "data": _plain(obj.data), "layout": _plain(obj.layout)})
        return

    if module.startswith("plotly") and hasattr(obj, "to_json"):
        fig = json.loads(obj.to_json())
        _emit({
            "type": "plotly",
            "data": fig.get("data", []),
            "layout": fig.get("layout", {}),
            "frames": fig.get("frames"),
        })
        return

    if module.startswith("matplotlib") and hasattr(obj, "savefig"):
        _emit({"type": "image", "format": "png", "data": _figure_png(obj)})
        return

    png = _repr(obj, "_repr_png_")
    if png:
        if isinstance(png, bytes):
            png = base64.b64encode(png).decode("ascii")
        _emit({"type": "image", "format": "png", "data": png})
        return

    html = _repr(obj, "_repr_html_")
    if isinstance(html, str):
        _emit({"type": "html", "html": html})
        return

    markdown = _repr(obj, "_repr_markdown_")
    if isinstance(markdown, str):
        _emit({"type": "markdown", "text": markdown})
        return

    _emit({"type": "stdio", "name": "stdout", "text": repr(obj)})


def display(*objs, **kwargs):
    for obj in objs:
        _display_one(obj)


def _is_installed(name):
    try:
        return importlib.util.find_spec(name) is not None
    except (ImportError, ValueError):
        return True


def _patch_ipython():
    """Send IPython.display.display to the cell's outputs; there's no kernel."""
    if not _is_installed("IPython"):
        return
    import IPython.display

    IPython.display.display = display


# Libraries the Sandworm theme has been applied to in this interpreter.
_themed = set()


def _apply_theme():
    """Give charts Sandworm's colors and font with no import in the cell.

    The cloud kernel does this once when its session starts (see
    buildSessionPreamble in apps/api's jupyter-session.service.ts). Here plotly
    and matplotlib arrive later, when a cell first imports them, so each is
    themed just before the first run that has it. A chart that sets its own
    style still wins.
    """
    try:
        from sandworm_theme import matplotlib_theme, plotly_theme
    except ImportError:
        return

    for name, apply in (("plotly", plotly_theme.apply), ("matplotlib", matplotlib_theme.apply)):
        if name in _themed or not _is_installed(name):
            continue
        try:
            apply()
            _themed.add(name)
        except ImportError:
            pass


def _patch_plotly():
    """Route fig.show() to the cell's outputs instead of a browser tab."""
    if not _is_installed("plotly"):
        return
    from plotly.basedatatypes import BaseFigure

    if getattr(BaseFigure.show, "_sandworm", False):
        return

    def show(self, *args, **kwargs):
        display(self)

    show._sandworm = True
    BaseFigure.show = show


async def ensure_imports(code):
    """Fetch imported packages Pyodide doesn't ship, from PyPI via micropip."""
    from pyodide.code import find_imports

    try:
        names = find_imports(code)
    except SyntaxError:
        return
    if "sandworm_theme" in names:
        names.append("IPython")  # sandworm_theme.show() displays through it
    missing = [n for n in names if not _is_installed(n)]
    if not missing:
        return

    import pyodide_js

    await pyodide_js.loadPackage("micropip")
    import micropip

    for name in missing:
        try:
            await micropip.install(PYPI_NAMES.get(name, name))
        except Exception:
            pass  # the import itself will raise a clear error


def new_namespace():
    return {"__name__": "__main__", "display": display}


def _cell_traceback(exc):
    tb = exc.__traceback__
    while tb is not None and tb.tb_frame.f_code.co_filename != CELL_FILENAME:
        tb = tb.tb_next
    if tb is None:
        return traceback.format_exception_only(type(exc), exc)
    return traceback.format_exception(type(exc), exc, tb)


def _error_output(exc):
    return {
        "type": "error",
        "ename": type(exc).__name__,
        "evalue": str(exc),
        "traceback": [line.rstrip("\n") for line in _cell_traceback(exc)],
    }


# ── Live cells ───────────────────────────────────────────────────────────────
# A cell can keep updating after it finishes, through the sandworm module:
# sandworm.every() re-runs a function on a timer, sandworm.websocket() keeps a
# socket open. Each update replaces the cell's output on this page only; it is
# never written to the notebook.

# Posts (notebook_id, block_id, outputs_json) to the page. Set by the worker.
_sink = None
# The cell being run, so sandworm.every() and websocket() know whose they are.
_cell = contextvars.ContextVar("sandworm_cell", default=None)
# (notebook_id, block_id) -> _Live, for every cell that's still updating.
_lives = {}


def set_sink(sink):
    global _sink
    _sink = sink


class _Live:
    """A cell's pollers and sockets, and what they last showed."""

    def __init__(self, notebook_id, block_id):
        self.notebook_id = notebook_id
        self.block_id = block_id
        self.base = []
        self.pollers = []
        self.sockets = []
        # Until the cell has finished, ticks land in its result instead.
        self.ready = False

    def outputs(self):
        outputs = list(self.base)
        for poller in self.pollers:
            outputs.extend(poller.last)
        # Charts are marked as live, so a page that opens the notebook later
        # can show them as loading until Python is producing them again,
        # instead of presenting an old snapshot as the current picture.
        for output in outputs:
            if output["type"] == "plotly":
                layout = output.get("layout")
                if not isinstance(layout, dict):
                    layout = output["layout"] = {}
                meta = layout.get("meta")
                layout["meta"] = {**meta, "live": True} if isinstance(meta, dict) else {"live": True}
        return outputs

    def publish(self):
        if self.ready and _sink is not None:
            text = _serialize(self.outputs(), MAX_LIVE_BYTES, "This live cell's update")
            _sink(self.notebook_id, self.block_id, text)
            if _is_too_large(text):
                # Stop it: the next tick would only be too big again.
                self.stop()
                _lives.pop((self.notebook_id, self.block_id), None)

    def stop(self):
        for poller in self.pollers:
            poller.task.cancel()
        for socket in self.sockets:
            socket.close()


def _live_cell():
    live = _cell.get()
    if live is None:
        raise RuntimeError("sandworm live cells only work inside a notebook cell")
    return live


class _Poller:
    def __init__(self, live, fn, seconds):
        self.last = []
        self.first = asyncio.get_event_loop().create_future()
        self.task = asyncio.ensure_future(self._loop(live, fn, seconds))

    async def _loop(self, live, fn, seconds):
        while True:
            await self._tick(live, fn)
            await asyncio.sleep(seconds)

    async def _tick(self, live, fn):
        outputs = []
        _current.set(outputs)
        try:
            result = fn()
            if inspect.isawaitable(result):
                result = await result
            display(result)
            flush_figures()
        except asyncio.CancelledError:
            raise
        except Exception as exc:
            _emit(_error_output(exc))
        self.last = outputs
        if not self.first.done():
            self.first.set_result(None)
        live.publish()


def start_poller(fn, seconds):
    live = _live_cell()
    live.pollers.append(_Poller(live, fn, seconds))


class _Socket:
    """A browser WebSocket that reconnects until the cell stops."""

    def __init__(self, url, on_message, subscribe, parse_json):
        self.url = url
        self.on_message = on_message
        self.subscribe = subscribe
        self.parse_json = parse_json
        self.ws = None
        self.closed = False
        self.delay = 1
        self.proxies = []
        self.connect()

    def connect(self):
        from js import WebSocket
        from pyodide.ffi import create_proxy

        if self.closed:
            return
        self.release()
        ws = WebSocket.new(self.url)
        ws.binaryType = "arraybuffer"

        def on_open(_event):
            self.delay = 1
            for message in self.subscribe:
                self.send(message)

        def on_message(event):
            data = event.data
            if not isinstance(data, str):
                data = bytes(data.to_py())
            elif self.parse_json:
                try:
                    data = json.loads(data)
                except ValueError:
                    pass
            try:
                self.on_message(data)
            except Exception:
                traceback.print_exc()

        def on_close(_event):
            if self.closed:
                return
            asyncio.get_event_loop().call_later(self.delay, self.connect)
            self.delay = min(self.delay * 2, 30)

        self.proxies = [create_proxy(on_open), create_proxy(on_message), create_proxy(on_close)]
        ws.onopen, ws.onmessage, ws.onclose = self.proxies
        self.ws = ws

    def send(self, message):
        if not isinstance(message, (str, bytes)):
            message = json.dumps(message)
        if self.ws is not None and self.ws.readyState == 1:
            self.ws.send(message)

    def release(self):
        if self.ws is not None:
            self.ws.onopen = self.ws.onmessage = self.ws.onclose = None
            self.ws.close()
        for proxy in self.proxies:
            proxy.destroy()
        self.proxies = []

    def close(self):
        self.closed = True
        self.release()


def open_websocket(url, on_message, subscribe, parse_json):
    live = _live_cell()
    if subscribe is None:
        subscribe = []
    elif not isinstance(subscribe, list):
        subscribe = [subscribe]
    socket = _Socket(url, on_message, subscribe, parse_json)
    live.sockets.append(socket)
    return socket


def stop_notebook(notebook_id):
    for key in [key for key in _lives if key[0] == notebook_id]:
        _lives.pop(key).stop()


def stop_all(message):
    """End every live cell, showing message in its place. Used when Python is
    close to running out of memory, so the cells stop adding to it."""
    stopped = json.dumps([{"type": "error", "ename": "MemoryLimit", "evalue": message, "traceback": []}])
    for (notebook_id, block_id), live in list(_lives.items()):
        live.stop()
        if _sink is not None:
            _sink(notebook_id, block_id, stopped)
    _lives.clear()


async def run(code, namespace, notebook_id="", block_id=""):
    from pyodide.code import eval_code_async

    # Re-running a cell replaces whatever it left updating.
    previous = _lives.pop((notebook_id, block_id), None)
    if previous is not None:
        previous.stop()

    live = _Live(notebook_id, block_id)
    outputs = []
    outputs_token = _current.set(outputs)
    cell_token = _cell.set(live)
    _patch_ipython()
    _patch_plotly()
    _apply_theme()
    try:
        result = await eval_code_async(code, namespace, filename=CELL_FILENAME)
        display(result)
        flush_figures()
    except BaseException as exc:
        flush_figures()
        _emit(_error_output(exc))
    finally:
        _current.reset(outputs_token)
        _cell.reset(cell_token)

    if not (live.pollers or live.sockets):
        return _serialize(outputs, MAX_RESULT_BYTES, "This cell's output")
    if any(o["type"] == "error" for o in outputs):
        live.stop()
        return _serialize(outputs, MAX_RESULT_BYTES, "This cell's output")

    # The first tick of each poller is part of the cell's result, so the
    # notebook saves a real snapshot rather than an empty cell.
    live.base = outputs
    await asyncio.gather(*(poller.first for poller in live.pollers))
    live.ready = True
    text = _serialize(live.outputs(), MAX_LIVE_BYTES, "This live cell's output")
    if _is_too_large(text):
        live.stop()
    else:
        _lives[(notebook_id, block_id)] = live
    return text


# ── SQL ──────────────────────────────────────────────────────────────────────
# Mirrors apps/api's DuckDB query engine: the query runs in DuckDB against the
# notebook's DataFrames, its result becomes a DataFrame named after the block,
# and rows are paged and stringified the same way.

SQL_PAGE_SIZE = 50


def _columns(df):
    return [{"name": c, "type": t.name} for c, t in df.dtypes.items()]


def _rows(df, start, end):
    rows = json.loads(df.iloc[start:end].to_json(orient="records", date_format="iso"))
    for row in rows:
        for key in row:
            row[key] = str(row[key])
    return rows


def _page_result(df, page, sorted_df=None):
    view = df if sorted_df is None else sorted_df
    start = page * SQL_PAGE_SIZE
    return {
        "version": 3,
        "type": "success",
        "columns": _columns(df),
        "rows": _rows(view, start, start + SQL_PAGE_SIZE),
        "count": len(df),
        "page": page,
        "pageSize": SQL_PAGE_SIZE,
        "pageCount": int(len(df) / SQL_PAGE_SIZE + 1),
        "dashboardPage": 0,
        "dashboardPageSize": 0,
        "dashboardPageCount": 1,
        "dashboardRows": [],
    }


def _render_sql(sql, namespace):
    """Fill {{ variable }} templates from the notebook, as the cloud does."""
    if "{{" not in sql and "{%" not in sql:
        return sql
    import jinja2

    return jinja2.Template(sql).render(**{k: v for k, v in namespace.items() if not k.startswith("__")})


def run_sql(sql, dataframe_name, namespace):
    import duckdb
    import pandas as pd

    try:
        sql = _render_sql(sql, namespace)
    except Exception as exc:
        return json.dumps({"type": "python-error", "ename": type(exc).__name__, "evalue": str(exc), "traceback": []})

    con = duckdb.connect()
    try:
        for name, value in namespace.items():
            if isinstance(value, pd.DataFrame) and name.isidentifier():
                con.register(name, value)
        relation = con.sql(sql)
        if relation is None:
            return json.dumps({"type": "success", "rows": [], "columns": [], "count": 0})
        df = relation.df()
    except Exception as exc:
        return json.dumps({"type": "syntax-error", "message": str(exc)})
    finally:
        con.close()

    namespace[dataframe_name] = df
    return json.dumps(_page_result(df, 0), default=str)


def read_page(dataframe_name, page, sort_json, namespace):
    df = namespace.get(dataframe_name)
    if df is None:
        return json.dumps({"type": "syntax-error", "message": f"{dataframe_name} is not defined; run the block again"})

    sort = json.loads(sort_json) if sort_json else None
    sorted_df = df
    if sort:
        ascending = sort["order"] == "asc"
        try:
            sorted_df = df.sort_values(by=sort["column"], ascending=ascending)
        except Exception:
            try:
                sorted_df = df.sort_values(by=sort["column"], ascending=ascending, key=lambda x: x.astype(str))
            except Exception:
                pass
    return json.dumps(_page_result(df, page, sorted_df), default=str)


def rename_variable(old, new, namespace):
    if old in namespace:
        namespace[new] = namespace.pop(old)


def list_dataframes(namespace):
    import pandas as pd

    return json.dumps(
        [
            {"name": name, "columns": _columns(value)}
            for name, value in namespace.items()
            if isinstance(value, pd.DataFrame) and not name.startswith("_")
        ],
        default=str,
    )


# ── Inputs ───────────────────────────────────────────────────────────────────


def set_variable(name, value, namespace):
    namespace[name] = value


# ── JavaScript cells ─────────────────────────────────────────────────────────
# A JavaScript cell reads the notebook's Python variables and can write its
# own back. Values cross as JSON: a DataFrame arrives as a list of row objects,
# arrays and Series as lists, dates as ISO strings.


def get_variables(names_json, namespace):
    values = {}
    for name in json.loads(names_json):
        if name not in namespace:
            continue
        value = namespace[name]
        if hasattr(value, "to_dict") and hasattr(value, "columns"):  # a DataFrame
            value = value.to_dict("records")
        values[name] = _plain(value)
    return json.dumps(values)


def set_json_variable(name, value_json, namespace):
    if not name.isidentifier():
        raise ValueError(f"{name!r} is not a valid variable name")
    namespace[name] = json.loads(value_json)


def set_date_variable(name, config_json, namespace):
    from datetime import date, datetime

    c = json.loads(config_json)
    v = c["value"]
    if c["dateType"] == "date":
        namespace[name] = date(v["year"], v["month"], v["day"])
        return
    import pytz

    namespace[name] = pytz.timezone(v["timezone"]).localize(
        datetime(v["year"], v["month"], v["day"], v["hours"], v["minutes"], v["seconds"])
    )
`;

// What notebook cells import, as `import sandworm as sw`.
export const SANDWORM_SOURCE = String.raw`
"""Live cells for browser notebooks.

Polling, re-running a function every few seconds:

    @sw.every(10)
    async def prices():
        r = await pyfetch("https://...")
        return make_chart(await r.json())

WebSockets, keeping data current as messages arrive:

    trades = []
    sw.websocket("wss://...", trades.append)

    @sw.every(1)
    def chart():
        return make_chart(trades[-500:])

Whatever the function returns (a figure, a DataFrame, text) replaces the
cell's output each time. Re-running the cell stops what it started.

Fast charts, for dashboards that redraw many of them every second:

    sw.plot({"type": "scatter", "x": times, "y": prices}, {"title": {"text": "ETH"}})

Smooth time series, scrolling at the screen's refresh rate between updates:

    sw.stream(times_ms, prices, title="ETH")
"""

import ${RUNTIME_MODULE} as _runtime

__all__ = ["every", "plot", "stream", "websocket"]


def stream(x, y, *, title=None, kind="line", window=None, height=None):
    """A time series that scrolls smoothly, however rarely its data updates.

    x is the times, as milliseconds since the epoch or as datetimes. y is one
    series, or a dict of name -> series to draw several. kind is "line", "area"
    or "bars" (several series of bars are stacked). window is how many seconds
    to show; by default, what the data covers.

    Return it from a sandworm.every() function with the latest data each time.
    The page redraws it on every screen frame and scrolls between updates, so
    it moves at the display's refresh rate. Where that isn't possible (a PDF,
    an image export) it's drawn as an ordinary chart.
    """
    if kind not in ("line", "area", "bars"):
        raise ValueError('sandworm.stream kind must be "line", "area" or "bars"')

    traces = []
    for name, values in (y.items() if isinstance(y, dict) else [(None, y)]):
        trace = {"type": "bar" if kind == "bars" else "scatter", "x": x, "y": values}
        if kind != "bars":
            trace["mode"] = "lines"
        if kind == "area":
            trace["fill"] = "tozeroy"
        if name is not None:
            trace["name"] = str(name)
        traces.append(trace)

    layout = {
        "xaxis": {"type": "date"},
        "showlegend": len(traces) > 1,
        "meta": {"sandworm": "stream", "kind": kind, "window": window},
    }
    if kind == "bars" and len(traces) > 1:
        layout["barmode"] = "stack"
    if title is not None:
        layout["title"] = {"text": str(title)}
    if height is not None:
        layout["height"] = height
    return _runtime.Plot(traces, layout)


def plot(data, layout=None):
    """A chart from plain plotly traces and layout, with no plotly import.

    data is one trace or a list of them, as dicts; values can be lists, numpy
    arrays or pandas Series. Much cheaper to build than a plotly figure, which
    is what matters when it's rebuilt on every tick.
    """
    return _runtime.Plot(data, layout)


def every(seconds):
    """Run the decorated function now, then again every seconds seconds."""
    if seconds < 0.5:
        raise ValueError("sandworm.every needs at least 0.5 seconds between runs")

    def decorate(fn):
        _runtime.start_poller(fn, float(seconds))
        return fn

    return decorate


def websocket(url, on_message, *, subscribe=None, parse_json=True):
    """Open a WebSocket and call on_message with each message.

    subscribe is a message (or list of messages) sent every time the socket
    connects; dicts are sent as JSON. Text messages are parsed as JSON when they
    can be. The socket reconnects if it drops. Returns it, with .send() and
    .close().
    """
    return _runtime.open_websocket(url, on_message, subscribe, parse_json)
`;

export const MPL_BACKEND_SOURCE = String.raw`
from matplotlib.backend_bases import FigureManagerBase as FigureManager  # noqa: F401
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas  # noqa: F401


def show(*args, **kwargs):
    import ${RUNTIME_MODULE}

    ${RUNTIME_MODULE}.flush_figures()
`;
