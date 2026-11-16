// =====================================
// ⬢ Display-time defaults for Plotly results
// =====================================
// A notebook stores its Plotly figures as the Python code made them, and code
// (especially AI-written code) repeats the same few mistakes: a legend dropped
// onto the axis labels, a legend title that only repeats a column name, thick
// treemap tiles, Plotly Express tooltips such as "token=ZC". They are fixed here,
// when the figure is drawn, so every notebook gets them, old ones included, and
// no notebook has to carry styling helpers.
//
// Every rule only fills in what the notebook left unset, or repairs a placement
// that cannot read well, and running it twice changes nothing more.

import type {
  PlotlyFigure,
  PlotlyLayout,
  PlotlyTrace,
} from "@sandworm/ui/lib/plotly-figure";

const TOOLTIP = "#17101C";

// The theme draws the legend just above the plot (sandworm_theme/plotly_theme.py).
const LEGEND_TOP = {
  orientation: "h",
  yanchor: "bottom",
  xanchor: "left",
  x: 0,
  y: 1.02,
};

// Room for a title plus a legend above the plot.
const TOP_MARGIN_WITH_LEGEND = 104;
const TOP_MARGIN_WITH_LEGEND_NO_TITLE = 56;

// The theme's pink-to-plum scale (sandworm_theme/tokens.py HEATMAP_SCALE). A figure stored
// with Plotly's own default (navy to yellow) carries no colorscale of its own, so it gets this.
const HEATMAP_SCALE = [
  [0, "#FDE7F4"],
  [0.5, "#EE149E"],
  [1, "#4B2E83"],
];
const SCALED_TYPES = new Set([
  "heatmap",
  "histogram2d",
  "histogram2dcontour",
  "contour",
  "surface",
]);

const TILE_TOP_MARGIN = { plain: 24, title: 48 };

const isNumber = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v);

function hasTitle(layout: PlotlyLayout): boolean {
  const { title } = layout;
  return !!(typeof title === "string" ? title : title?.text);
}

// Plotly draws a legend on its own for two or more named traces (and for a pie),
// without the notebook ever setting `layout.legend`.
function legendShown(layout: PlotlyLayout, data: PlotlyTrace[]): boolean {
  if (layout.showlegend === false) return false;
  if (layout.showlegend === true || layout.legend) return true;
  const listed = data.filter(t => t.showlegend !== false);
  if (listed.some(t => t.type === "pie")) return true;
  return listed.filter(t => typeof t.name === "string" && t.name).length > 1;
}

// Top margin for a figure drawn in a small dashboard tile. The theme's own roomy
// margin is replaced there by a compact one, which left the legend sitting on the
// title; reserve the room whenever a legend will be drawn above the plot.
export function tileTopMargin(
  layout: PlotlyLayout,
  data: PlotlyTrace[]
): number {
  const title = hasTitle(layout);
  if (legendShown(layout, data)) {
    return title ? TOP_MARGIN_WITH_LEGEND : TOP_MARGIN_WITH_LEGEND_NO_TITLE;
  }
  return title ? TILE_TOP_MARGIN.title : TILE_TOP_MARGIN.plain;
}

function normalizeLegend(layout: PlotlyLayout): PlotlyLayout {
  const { legend } = layout;
  if (!legend || layout.showlegend === false) {
    return layout;
  }
  const next = { ...legend };
  let margin = layout.margin;

  // A legend under the plot lands on the tick labels and axis title.
  if (next.orientation === "h" && isNumber(next.y) && next.y < 0) {
    Object.assign(next, LEGEND_TOP);
    const needed = hasTitle(layout)
      ? TOP_MARGIN_WITH_LEGEND
      : TOP_MARGIN_WITH_LEGEND_NO_TITLE;
    const top = margin?.t;
    if (!isNumber(top) || top < needed) {
      margin = { ...margin, t: needed };
    }
  }

  // Plotly Express titles the legend with a column name ("token", "variable").
  if (next.title?.text) {
    next.title = { ...next.title, text: "" };
  }

  return { ...layout, legend: next, ...(margin ? { margin } : {}) };
}

// Plotly Express writes "column=%{x}" tooltips. Replace them with a small muted
// label over the value, large: "September 2026 · Token / $79,357". The label is
// dimmed with opacity, not a colour, so it reads in both themes.
const PX_HOVER = /(^|<br>)[^<%]*=%\{[xy]\}/;

const hoverLabel = (text: string) =>
  `<span style="font-size:12.5px;opacity:0.65">${text}</span>`;
const hoverValue = (text: string) =>
  `<span style="font-size:20px;font-weight:600">${text}</span>`;

const CARTESIAN = ["bar", "scatter", "scattergl"];

// A chart of several series shows one tooltip for the hovered x, listing every
// series, instead of a box per series that covers the others. Left alone when the
// notebook chose its own hover mode, and for horizontal bars, which read by y.
function wantsUnifiedHover(data: PlotlyTrace[], layout: PlotlyLayout): boolean {
  if (layout.hovermode !== undefined) return false;
  if (data.some(t => t.orientation === "h")) return false;
  const named = data.filter(
    t =>
      CARTESIAN.includes(t.type ?? "scatter") &&
      typeof t.name === "string" &&
      t.name
  );
  return named.length > 1 && named.length === data.length;
}

function plainHover(
  trace: PlotlyTrace,
  isUnified: boolean
): string | undefined {
  const template = trace.hovertemplate;
  if (typeof template !== "string" || !PX_HOVER.test(template)) {
    return undefined;
  }
  if (/customdata|%\{text|%\{hovertext/.test(template)) {
    return undefined;
  }
  if (!CARTESIAN.includes(trace.type ?? "scatter")) {
    return undefined;
  }
  // The combined tooltip heads itself with the x: each row is a series and its value.
  if (isUnified) return "<b>%{y}</b><extra>%{fullData.name}</extra>";
  const series =
    typeof trace.name === "string" && trace.name
      ? ` · ${trace.name.replace(/[<>%{}]/g, "")}`
      : "";
  return trace.orientation === "h"
    ? `${hoverLabel(`%{y}${series}`)}<br>${hoverValue("%{x}")}<extra></extra>`
    : `${hoverLabel(`%{x}${series}`)}<br>${hoverValue("%{y}")}<extra></extra>`;
}

function normalizeTrace(
  trace: PlotlyTrace,
  isUnified: boolean,
  isStacked: boolean
): PlotlyTrace {
  const next = { ...trace };

  switch (trace.type) {
    case "treemap": {
      // Plotly's own defaults (3px of padding, a 1px grey line, a path bar)
      // make thick tiles that shrink the labels.
      next.marker = {
        ...trace.marker,
        cornerradius: trace.marker?.cornerradius ?? 8,
        line: {
          ...trace.marker?.line,
          width: trace.marker?.line?.width ?? 1,
          color: trace.marker?.line?.color ?? "#FFFFFF",
        },
      };
      next.tiling = { ...trace.tiling, pad: trace.tiling?.pad ?? 1 };
      next.pathbar = {
        ...trace.pathbar,
        visible: trace.pathbar?.visible ?? false,
      };
      break;
    }
    case "heatmap": {
      next.xgap = trace.xgap ?? 1;
      next.ygap = trace.ygap ?? 1;
      break;
    }
    case "bar": {
      // Plotly Express gives every series its own offsetgroup. Plotly 3 then draws
      // a stacked chart as separate columns side by side, so a stack drops it.
      if (isStacked) delete next.offsetgroup;
      next.marker = {
        ...trace.marker,
        line: { ...trace.marker?.line, width: trace.marker?.line?.width ?? 0 },
      };
      break;
    }
  }

  if (
    trace.type &&
    SCALED_TYPES.has(trace.type) &&
    !trace.colorscale &&
    !trace.coloraxis
  ) {
    next.colorscale = HEATMAP_SCALE;
  }

  const hover = plainHover(trace, isUnified);
  if (hover) {
    next.hovertemplate = hover;
  }
  return next;
}

function largestValue(data: PlotlyTrace[]): number {
  let max = 0;
  for (const trace of data) {
    const values = trace.orientation === "h" ? trace.x : trace.y;
    if (!Array.isArray(values)) continue;
    for (const v of values) {
      if (isNumber(v) && Math.abs(v) > max) max = Math.abs(v);
    }
  }
  return max;
}

export function withSandwormDefaults<T extends PlotlyFigure>(figure: T): T {
  let layout = { ...figure.layout };
  const isUnified = wantsUnifiedHover(figure.data ?? [], layout);
  const isStacked = ["stack", "relative"].includes(layout.barmode ?? "");
  const data = (figure.data ?? []).map(trace =>
    normalizeTrace(trace, isUnified, isStacked)
  );
  if (isUnified) layout.hovermode = "x unified";

  if (
    data.some(t => t.type === "bar") &&
    layout.barcornerradius === undefined
  ) {
    layout.barcornerradius = 6;
  }

  layout = normalizeLegend(layout);

  // Same box and corners for every tooltip: set the border to the fill so the
  // rounded-corner CSS (globals.scss) has a stroke to round.
  layout.hoverlabel = {
    align: "left",
    ...layout.hoverlabel,
    bgcolor: layout.hoverlabel?.bgcolor ?? TOOLTIP,
    bordercolor:
      layout.hoverlabel?.bordercolor ?? layout.hoverlabel?.bgcolor ?? TOOLTIP,
  };

  // Whole numbers in tooltips for large values, unless the axis says otherwise.
  const cartesian = data.some(t => CARTESIAN.includes(t.type ?? "scatter"));
  const valueAxis = data.some(t => t.orientation === "h") ? "xaxis" : "yaxis";
  if (
    cartesian &&
    !layout[valueAxis]?.tickformat &&
    !layout[valueAxis]?.hoverformat &&
    largestValue(data) >= 1000
  ) {
    layout[valueAxis] = { ...layout[valueAxis], hoverformat: ",.0f" };
  }

  return { ...figure, data, layout } as T;
}
