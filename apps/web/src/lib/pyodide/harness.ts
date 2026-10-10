// Python modules written into Pyodide's filesystem at startup. They turn a
// cell run into the same Output[] the cloud kernel produces (see
// apps/api/.../jupyter-session/iopub-decoder.ts), so results render and sync
// identically whichever runtime made them.

export const RUNTIME_MODULE = "_sandworm_runtime";
export const MPL_BACKEND_MODULE = "_sandworm_mpl_backend";

export const RUNTIME_SOURCE = String.raw`
import base64
import importlib.util
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

_outputs = []


def _emit(output):
    _outputs.append(output)


class _Stream(io.TextIOBase):
    def __init__(self, name):
        self._name = name

    def writable(self):
        return True

    def write(self, text):
        if not text:
            return 0
        last = _outputs[-1] if _outputs else None
        if last and last["type"] == "stdio" and last["name"] == self._name:
            last["text"] += text
        else:
            _emit({"type": "stdio", "name": self._name, "text": text})
        return len(text)


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


def _display_one(obj):
    if obj is None:
        return
    module = type(obj).__module__ or ""

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


async def run(code, namespace):
    from pyodide.code import eval_code_async

    _outputs.clear()
    _patch_ipython()
    _patch_plotly()
    stdout, stderr = sys.stdout, sys.stderr
    sys.stdout, sys.stderr = _Stream("stdout"), _Stream("stderr")
    try:
        result = await eval_code_async(code, namespace, filename=CELL_FILENAME)
        display(result)
        flush_figures()
    except BaseException as exc:
        flush_figures()
        _emit({
            "type": "error",
            "ename": type(exc).__name__,
            "evalue": str(exc),
            "traceback": [line.rstrip("\n") for line in _cell_traceback(exc)],
        })
    finally:
        sys.stdout, sys.stderr = stdout, stderr
    return json.dumps(_outputs, default=str)


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

export const MPL_BACKEND_SOURCE = String.raw`
from matplotlib.backend_bases import FigureManagerBase as FigureManager  # noqa: F401
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas  # noqa: F401


def show(*args, **kwargs):
    import ${RUNTIME_MODULE}

    ${RUNTIME_MODULE}.flush_figures()
`;
