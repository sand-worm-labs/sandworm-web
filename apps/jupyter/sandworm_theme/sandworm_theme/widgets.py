"""Interactive tiles that work on a published page, where no Python runs.

    from sandworm_theme import switchable, data_table, tcol

    switchable("who", {"Winners": fig_a, "One wallet": (fig_b, "The finding as a title", "A note under it")})
    data_table("wallets", df, [tcol("address", "Wallet", mono=True, copy=True), tcol("value", "Held", kind="num", bar=True)])

Both draw their data into the page once; the reader's browser does the switching, sorting, searching and
paging. They follow the theme on their own, so a notebook never carries its own copy of this code:

- colours come from the theme (a figure's own `marker_color` still wins, but do not set one);
- title and legend are page text above the plot, never inside the figure, as `chart()` does;
- every bar label sits outside its bar at one size, so labels never flip between tiny white text inside a bar and
  large dark text outside it.
"""
import json
from html import escape
from typing import Dict, Optional, Sequence

from . import tokens as t
from .html import render
from .plotly_theme import PLOT_CONFIG

# The plotly.js bundle the page loads: scatter, bar, pie, heatmap, histogram, box and contour. A chart type outside
# this list (treemap, sunburst, 3D, maps) would draw an empty tile, so `switchable` refuses it up front.
_BUNDLE = "plotly-cartesian-2.27.0.min.js"
SUPPORTED_TRACES = ("scatter", "bar", "pie", "heatmap", "histogram", "box", "contour")

_LABEL_SIZE = 12
_MAX_HEIGHT = 480


def _fill(text: str) -> str:
    """Put the theme's colours into the CSS as the fallback of each variable."""
    for key, value in (("@INK@", t.INK), ("@INK2@", t.INK_2), ("@MUTED@", t.MUTED), ("@PAPER@", t.PAPER), ("@SHADE@", t.SHADE),
                       ("@RULE@", t.RULE), ("@POS@", t.POS), ("@NEG@", t.NEG), ("@BRAND@", t.BRAND), ("@ACCENT@", t.SERIES[0])):
        text = text.replace(key, value)
    return text


def _js(obj) -> str:
    from plotly.utils import PlotlyJSONEncoder

    return json.dumps(obj, cls=PlotlyJSONEncoder).replace("</", "<\\/")


# --------------------------------------------------------------------------------------------------
# switchable
# --------------------------------------------------------------------------------------------------
_SWITCH_CSS = _fill("""
.swx{border:1px solid var(--sw-rule,@RULE@);border-radius:16px;overflow:hidden;background:var(--sw-paper,@PAPER@)}
.swx-bar{display:flex;flex-wrap:wrap;align-items:center;gap:10px 14px;padding:12px 16px;background:var(--sw-shade,@SHADE@);border-bottom:1px solid var(--sw-rule,@RULE@)}
.swx-lab{color:var(--sw-muted,@MUTED@);font-size:14px}
.swx-grp{display:inline-flex;gap:2px;padding:3px;background:var(--sw-paper,@PAPER@);border:1px solid var(--sw-rule,@RULE@);border-radius:999px;flex-wrap:wrap}
.swx-grp button{border:0;background:transparent;color:var(--sw-muted,@MUTED@);font:inherit;font-size:14px;padding:6px 14px;border-radius:999px;cursor:pointer;white-space:nowrap}
.swx-grp button:hover{background:var(--sw-shade,@SHADE@)}
.swx-grp button.on{background:@BRAND@;color:#fff;font-weight:700}
.swx-title{margin:0;padding:14px 16px 0;font-size:17px;font-weight:600;line-height:1.3;color:var(--sw-ink,@INK@)}
.swx-plot{position:relative;min-height:380px;padding:0 6px 4px;color:var(--sw-muted,@MUTED@);font-size:14px}
.swx-note{padding:0 16px 12px;font-size:12px;color:var(--sw-muted,@MUTED@)}
.swx-spin{position:absolute;top:50%;left:50%;width:28px;height:28px;margin:-14px 0 0 -14px;border:3px solid var(--sw-rule,@RULE@);border-top-color:@ACCENT@;border-radius:50%;animation:swxspin .8s linear infinite}
@keyframes swxspin{to{transform:rotate(360deg)}}
@media (max-width:520px){.swx-bar{padding:10px 12px;gap:8px 10px}.swx-grp button{font-size:13px;padding:6px 10px}.swx-title{font-size:15px;padding:12px 12px 0}.swx-plot{padding:0 2px 4px}}
""")

_SWITCH_BODY = """
<div id="__UID__" class="swx">
  <div class="swx-bar"></div>
  <h4 class="swx-title"></h4>
  <div class="swx-plot"><div class="swx-spin" role="status" aria-label="Loading chart"></div></div>
  <div class="swx-note"></div>
</div>
<script>
(function () {
  var FIGS = __FIGS__, CONTROLS = __CONTROLS__, CFG = __CFG__;
  var root = document.getElementById("__UID__");
  if (!root) return;
  var DARK = !!getComputedStyle(document.documentElement).getPropertyValue("--sw-ink").trim();
  var MAP = { "#17101c": "#f3f0f5", "#1b1320": "#f3f0f5", "#42364c": "#cfc8d6", "#6f6478": "#a5a5a4", "#e9e2ed": "#40403e",
              "#faf6fc": "#2f2f2e", "#84185c": "#c1428a", "#4b2e83": "#9a7bdb", "rgba(255,255,255,0.85)": "rgba(39,39,38,0.85)" };
  function dk(v) {
    if (!DARK) return v;
    if (typeof v === "string") { return MAP[v.trim().toLowerCase()] || v; }
    if (Array.isArray(v)) return v.map(dk);
    if (v && typeof v === "object") { var o = {}; for (var k in v) o[k] = dk(v[k]); return o; }
    return v;
  }
  if (DARK) {
    FIGS = dk(FIGS);
    var tip = { bgcolor: "#f3f0f5", bordercolor: "#f3f0f5", font: { color: "#272726", size: 13 } };
    Object.keys(FIGS).forEach(function (k) {
      FIGS[k].layout.hoverlabel = tip;
      if (FIGS[k].layout.template && FIGS[k].layout.template.layout) FIGS[k].layout.template.layout.hoverlabel = tip;
    });
  }
  var bar = root.querySelector(".swx-bar"), plot = root.querySelector(".swx-plot");
  var titleEl = root.querySelector(".swx-title"), noteEl = root.querySelector(".swx-note");
  var state = {};
  CONTROLS.forEach(function (c) { state[c.id] = c.default; });

  CONTROLS.forEach(function (c) {
    if (c.options.length < 2) return;
    var lab = document.createElement("span"); lab.className = "swx-lab"; lab.textContent = c.label; bar.appendChild(lab);
    var grp = document.createElement("div"); grp.className = "swx-grp";
    c.options.forEach(function (o) {
      var b = document.createElement("button"); b.type = "button"; b.textContent = o[1];
      if (o[0] === c.default) b.className = "on";
      b.addEventListener("click", function () {
        state[c.id] = o[0];
        grp.querySelectorAll("button").forEach(function (x) { x.classList.toggle("on", x === b); });
        draw();
      });
      grp.appendChild(b);
    });
    bar.appendChild(grp);
  });
  if (!bar.children.length) bar.style.display = "none";

  function figKey() {
    return CONTROLS.filter(function (c) { return c.role === "fig"; }).map(function (c) { return state[c.id]; }).join("|");
  }

  function draw() {
    var fig = FIGS[figKey()] || FIGS[Object.keys(FIGS)[0]];
    var narrow = (plot.clientWidth || root.clientWidth || 800) < 560;
    titleEl.textContent = fig.title;
    noteEl.textContent = fig.note || ""; noteEl.style.display = fig.note ? "" : "none";
    var layout = JSON.parse(JSON.stringify(fig.layout));
    if (narrow) { layout.height = Math.min(layout.height || 420, 380); layout.margin.l = Math.min(layout.margin.l, 46); layout.margin.r = 10; }
    window.Plotly.react(plot, fig.data, layout, CFG);
  }

  function boot() {
    plot.textContent = "";
    draw();
    var timer = null;
    window.addEventListener("resize", function () { clearTimeout(timer); timer = setTimeout(draw, 150); });
  }
  if (window.Plotly) boot();
  else {
    var s = document.createElement("script");
    s.src = "https://cdn.plot.ly/__BUNDLE__";
    s.onload = boot;
    s.onerror = function () { plot.textContent = "The chart could not load. Please refresh the page."; };
    document.head.appendChild(s);
  }
})();
</script>
"""

def _prepare(fig, title: Optional[str], note: Optional[str]) -> dict:
    """One view as the page needs it: title and note as text, the figure without a title and with a legend only
    when two or more series need one, bar labels outside at one size, and a modest height."""
    spec = fig.to_plotly_json() if hasattr(fig, "to_plotly_json") else dict(fig)
    data, layout = spec.get("data", []), dict(spec.get("layout", {}))
    for trace in data:
        kind = trace.get("type", "scatter")
        if kind not in SUPPORTED_TRACES:
            raise ValueError(f"switchable cannot draw a {kind!r} chart; use one of {', '.join(SUPPORTED_TRACES)}")
        if kind == "bar" and trace.get("text") is not None:
            trace["textposition"] = "outside"
            trace["textfont"] = {**(trace.get("textfont") or {}), "size": _LABEL_SIZE}
            trace["cliponaxis"] = False
    if title is None:
        raw = layout.get("title")
        title = (raw.get("text") if isinstance(raw, dict) else raw) or ""
    legend = len({d.get("name") for d in data if d.get("name") and d.get("showlegend") is not False}) > 1
    layout["title"] = {"text": ""}
    layout["showlegend"] = legend
    layout["height"] = min(int(layout.get("height") or 420), _MAX_HEIGHT)
    layout["margin"] = {"t": 46 if legend else 20, "b": 40, "l": 56, "r": 20}
    layout["legend"] = {"orientation": "h", "x": 0, "y": 1.02, "yanchor": "bottom"}
    return {"title": title, "data": data, "layout": layout, "note": note}


def switchable(uid: str, views: Dict[str, object], label: str = "Show") -> None:
    """Draw one tile with buttons that switch between views of the same question.

    `views` maps the button text to a Plotly figure, or to `(figure, title)` or `(figure, title, note)`. The title is
    the finding in under about 60 characters; the note sits under the chart. Build each figure as usual, without a
    title, legend or colours: name every series and the theme colours it. Bar, line, scatter, pie, heatmap,
    histogram, box and contour charts work; other chart types raise an error. `uid` is a short unique id.
    """
    from IPython.display import HTML, display

    if not views:
        raise ValueError("switchable needs at least one view")
    figs: Dict[str, dict] = {}
    for key, value in views.items():
        fig, title, note = (value + (None, None))[:3] if isinstance(value, tuple) else (value, None, None)
        figs[str(key)] = _prepare(fig, title, note)
    first = next(iter(figs))
    controls = [{"id": "show", "label": label, "role": "fig", "options": [[k, k] for k in figs], "default": first}]
    body = (_SWITCH_BODY.replace("__UID__", escape(uid, quote=True)).replace("__FIGS__", _js(figs)).replace("__CONTROLS__", _js(controls))
            .replace("__CFG__", _js(dict(PLOT_CONFIG, responsive=True))).replace("__BUNDLE__", _BUNDLE))
    display(HTML(render(f"<style>{_SWITCH_CSS}</style>{body}")))


# --------------------------------------------------------------------------------------------------
# data_table
# --------------------------------------------------------------------------------------------------
_TABLE_CSS = _fill("""
.swt{border:1px solid var(--sw-rule,@RULE@);border-radius:16px;overflow:hidden;background:var(--sw-paper,@PAPER@)}
.swt-top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;background:var(--sw-shade,@SHADE@);border-bottom:1px solid var(--sw-rule,@RULE@)}
.swt-title{font-weight:600;font-size:16px;color:var(--sw-ink,@INK@)}
.swt-search{border:1px solid var(--sw-rule,@RULE@);background:var(--sw-paper,@PAPER@);color:var(--sw-ink,@INK@);border-radius:999px;padding:6px 14px;font:inherit;font-size:14px;width:200px;max-width:50%;min-width:0}
.swt-scroll{overflow-x:auto}
.swt table{width:100%;border-collapse:collapse;font-size:14px}
.swt th{padding:10px 14px;font-size:12px;font-weight:500;color:var(--sw-muted,@MUTED@);text-align:left;white-space:nowrap;border-bottom:1px solid var(--sw-rule,@RULE@);cursor:pointer;user-select:none}
.swt th:hover{color:var(--sw-ink,@INK@)}
.swt th .ar{display:inline-block;width:12px;margin-left:4px}
.swt td{padding:11px 14px;border-top:1px solid var(--sw-rule,@RULE@);vertical-align:top;white-space:nowrap;color:var(--sw-ink,@INK@)}
.swt tbody tr:first-child td{border-top:0}
.swt tbody tr:hover td{background:var(--sw-shade,@SHADE@)}
.swt td.mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px}
.swt td.pos{color:var(--sw-pos,@POS@);font-weight:600}
.swt td.neg{color:var(--sw-neg,@NEG@);font-weight:600}
.swt-pill{display:inline-block;border:1px solid var(--sw-rule,@RULE@);border-radius:999px;padding:2px 10px;font-size:12px;color:var(--sw-ink-2,@INK2@)}
.swt-bar{height:6px;border-radius:3px;background:var(--sw-shade,@SHADE@);margin-top:6px;min-width:80px}
.swt-bar i{display:block;height:6px;border-radius:3px;background:@ACCENT@}
.swt-copy{border:0;background:transparent;color:var(--sw-muted,@MUTED@);cursor:pointer;padding:2px 4px;vertical-align:middle;border-radius:6px;line-height:0}
.swt-copy:hover{background:var(--sw-shade,@SHADE@);color:var(--sw-ink,@INK@)}
.swt-copy.done{color:var(--sw-pos,@POS@)}
.swt-foot{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;padding:12px 16px;border-top:1px solid var(--sw-rule,@RULE@);font-size:13px;color:var(--sw-muted,@MUTED@)}
.swt-pager{display:inline-flex;align-items:center;gap:8px}
.swt-pager button{border:1px solid var(--sw-rule,@RULE@);background:var(--sw-paper,@PAPER@);color:var(--sw-ink,@INK@);border-radius:10px;width:34px;height:34px;cursor:pointer;font:inherit;font-size:18px;line-height:1}
.swt-pager button:disabled{opacity:.4;cursor:default}
.swt-page{min-width:72px;text-align:center;border:1px solid var(--sw-rule,@RULE@);border-radius:10px;padding:6px 10px;color:var(--sw-ink,@INK@)}
@media (max-width:520px){.swt-top{padding:10px 12px}.swt th,.swt td{padding:10px 10px}.swt-search{width:140px}}
""")

_TABLE_BODY = """
<div id="__UID__" class="swt">
  <div class="swt-top"><div class="swt-title">__TITLE__</div><input class="swt-search" type="search" placeholder="Search" aria-label="Search the table"></div>
  <div class="swt-scroll"><table><thead></thead><tbody></tbody></table></div>
  <div class="swt-foot"><span class="swt-count"></span><span class="swt-pager"><button class="swt-prev" type="button" aria-label="Previous page">&lsaquo;</button><span class="swt-page"></span><button class="swt-next" type="button" aria-label="Next page">&rsaquo;</button></span></div>
</div>
<script>
(function () {
  var ROWS = __ROWS__, COLS = __COLS__, PAGE = __PAGE__, NOUN = __NOUN__;
  var root = document.getElementById("__UID__");
  if (!root) return;
  var head = root.querySelector("thead"), body = root.querySelector("tbody");
  var countEl = root.querySelector(".swt-count"), pageEl = root.querySelector(".swt-page");
  var prev = root.querySelector(".swt-prev"), next = root.querySelector(".swt-next"), box = root.querySelector(".swt-search");
  if (!__SEARCH__) box.style.display = "none";
  if (!root.querySelector(".swt-title").textContent) root.querySelector(".swt-top").style.justifyContent = "flex-end";
  var state = { page: 0, sort: __SORT__, desc: __DESC__, q: "" };
  var ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"></rect><path d="M5 15V6a2 2 0 0 1 2-2h9"></path></svg>';
  var max = COLS.map(function (c, i) {
    if (!c.bar) return 0;
    var m = 0; ROWS.forEach(function (r) { var v = r[i].v; if (v != null && Math.abs(v) > m) m = Math.abs(v); }); return m;
  });
  function esc(s) { return String(s).replace(/[&<>"]/g, function (ch) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]; }); }

  function rows() {
    var q = state.q.trim().toLowerCase(), out = ROWS;
    if (q) out = ROWS.filter(function (r) { return r.some(function (c) { return c.t.toLowerCase().indexOf(q) >= 0 || (c.c && c.c.toLowerCase().indexOf(q) >= 0); }); });
    if (state.sort !== null) {
      var i = state.sort, num = COLS[i].kind === "num";
      out = out.slice().sort(function (a, b) {
        var x = a[i].v, y = b[i].v;
        if (x == null) return 1; if (y == null) return -1;
        var d = num ? x - y : String(x).localeCompare(String(y));
        return state.desc ? -d : d;
      });
    }
    return out;
  }
  function cell(c, i) {
    var col = COLS[i], cls = col.mono ? "mono" : "", inner = esc(c.t);
    if (col.tone && c.v != null) cls += c.v >= 0 ? " pos" : " neg";
    if (col.pill && c.t) inner = '<span class="swt-pill">' + inner + "</span>";
    if (col.copy) inner += ' <button class="swt-copy" type="button" data-copy="' + esc(c.c) + '" title="Copy" aria-label="Copy">' + ICON + "</button>";
    if (col.bar && c.v != null && max[i]) inner += '<div class="swt-bar"><i style="width:' + Math.max(2, Math.abs(c.v) / max[i] * 100).toFixed(1) + '%"></i></div>';
    return '<td class="' + cls + '">' + inner + "</td>";
  }
  function drawHead() {
    head.innerHTML = "<tr>" + COLS.map(function (c, i) {
      var arrow = state.sort === i ? (state.desc ? "&darr;" : "&uarr;") : "";
      return '<th data-i="' + i + '">' + esc(c.label) + '<span class="ar">' + arrow + "</span></th>";
    }).join("") + "</tr>";
  }
  function draw() {
    var all = rows(), pages = Math.max(1, Math.ceil(all.length / PAGE));
    state.page = Math.min(state.page, pages - 1);
    var from = state.page * PAGE, slice = all.slice(from, from + PAGE);
    body.innerHTML = slice.map(function (r) { return "<tr>" + r.map(cell).join("") + "</tr>"; }).join("");
    countEl.textContent = all.length
      ? "Showing " + (from + 1).toLocaleString() + "\\u2013" + (from + slice.length).toLocaleString() + " of " + all.length.toLocaleString() + " " + NOUN
      : "No " + NOUN + " match";
    pageEl.textContent = (state.page + 1).toLocaleString() + " of " + pages.toLocaleString();
    prev.disabled = state.page === 0; next.disabled = state.page >= pages - 1;
    drawHead();
  }
  head.addEventListener("click", function (e) {
    var th = e.target.closest("th"); if (!th) return;
    var i = parseInt(th.getAttribute("data-i"), 10);
    if (state.sort === i) state.desc = !state.desc; else { state.sort = i; state.desc = COLS[i].kind === "num"; }
    state.page = 0; draw();
  });
  body.addEventListener("click", function (e) {
    var b = e.target.closest(".swt-copy"); if (!b) return;
    var text = b.getAttribute("data-copy");
    function done() { b.classList.add("done"); setTimeout(function () { b.classList.remove("done"); }, 1200); }
    function legacy() {
      var t = document.createElement("textarea"); t.value = text; t.style.position = "fixed"; t.style.opacity = "0";
      document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); done(); } catch (err) {}
      document.body.removeChild(t);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, legacy); else legacy();
  });
  box.addEventListener("input", function () { state.q = box.value; state.page = 0; draw(); });
  prev.addEventListener("click", function () { state.page -= 1; draw(); });
  next.addEventListener("click", function () { state.page += 1; draw(); });
  draw();
})();
</script>
"""


def tcol(key, label, kind="text", fmt=None, bar=False, pill=False, tone=False, mono=False, copy=False):
    """One column of `data_table`.

    `key` is the DataFrame column; `kind="num"` sorts by number. `fmt` turns a value into the text shown. `bar` draws
    an inline bar under the number, `pill` wraps the text in a pill, `tone` colours it by sign, `mono` sets it in a
    monospace font, and `copy` adds a button that copies the full, unformatted value.
    """
    return {"key": key, "label": label, "kind": kind, "fmt": fmt, "bar": bar, "pill": pill, "tone": tone, "mono": mono, "copy": copy}


def data_table(
    uid: str,
    frame,
    columns: Sequence[dict],
    page_size: int = 10,
    sort: Optional[str] = None,
    desc: bool = True,
    title: str = "",
    noun: str = "results",
    search: bool = True,
) -> None:
    """Draw `frame` as a table the reader can sort, search and page through. `columns` come from `tcol(...)`."""
    import pandas as pd
    from IPython.display import HTML, display

    rows = []
    for record in frame.to_dict("records"):
        cells = []
        for c in columns:
            raw = record[c["key"]]
            missing = raw is None or (isinstance(raw, float) and pd.isna(raw))
            text = "" if missing else (c["fmt"](raw) if c["fmt"] else str(raw))
            cell = {"v": None if missing else (float(raw) if c["kind"] == "num" else text), "t": text}
            if c["copy"]:
                cell["c"] = str(raw)
            cells.append(cell)
        rows.append(cells)
    spec = [{k: c[k] for k in ("label", "kind", "bar", "pill", "tone", "mono", "copy")} for c in columns]
    sort_index = next((i for i, c in enumerate(columns) if c["key"] == sort), None)
    body = (_TABLE_BODY.replace("__UID__", escape(uid, quote=True)).replace("__ROWS__", _js(rows)).replace("__COLS__", _js(spec))
            .replace("__PAGE__", str(int(page_size))).replace("__SORT__", "null" if sort_index is None else str(sort_index))
            .replace("__DESC__", "true" if desc else "false").replace("__TITLE__", escape(title))
            .replace("__NOUN__", _js(noun)).replace("__SEARCH__", "true" if search else "false"))
    display(HTML(render(f"<style>{_TABLE_CSS}</style>{body}")))
