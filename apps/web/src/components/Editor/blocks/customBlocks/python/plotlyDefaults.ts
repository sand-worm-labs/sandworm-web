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

type Figure = { data: any[]; layout: any; frames?: any };

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

const isNumber = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v);

function hasTitle(layout: any): boolean {
  const title = layout?.title;
  return !!(typeof title === "string" ? title : title?.text);
}

function normalizeLegend(layout: any): any {
  const legend = layout.legend;
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
    if (!isNumber(margin?.t) || margin.t < needed) {
      margin = { ...margin, t: needed };
    }
  }

  // Plotly Express titles the legend with a column name ("token", "variable").
  if (next.title?.text) {
    next.title = { ...next.title, text: "" };
  }

  return { ...layout, legend: next, ...(margin ? { margin } : {}) };
}

// Plotly Express writes "column=%{x}" tooltips. Replace them with the value and
// series, in plain words: "September 2026 / $79,357  Token".
const PX_HOVER = /(^|<br>)[^<%]*=%\{[xy]\}/;

function plainHover(trace: any): string | undefined {
  const template = trace.hovertemplate;
  if (typeof template !== "string" || !PX_HOVER.test(template)) {
    return undefined;
  }
  if (/customdata|%\{text|%\{hovertext/.test(template)) {
    return undefined;
  }
  if (!["bar", "scatter", "scattergl"].includes(trace.type ?? "scatter")) {
    return undefined;
  }
  const series =
    typeof trace.name === "string" && trace.name
      ? `  ${trace.name.replace(/[<>%{}]/g, "")}`
      : "";
  return trace.orientation === "h"
    ? `%{y}<br><b>%{x}</b>${series}<extra></extra>`
    : `%{x}<br><b>%{y}</b>${series}<extra></extra>`;
}

function normalizeTrace(trace: any): any {
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
      next.pathbar = { ...trace.pathbar, visible: trace.pathbar?.visible ?? false };
      break;
    }
    case "heatmap": {
      next.xgap = trace.xgap ?? 1;
      next.ygap = trace.ygap ?? 1;
      break;
    }
    case "bar": {
      next.marker = {
        ...trace.marker,
        line: { ...trace.marker?.line, width: trace.marker?.line?.width ?? 0 },
      };
      break;
    }
  }

  const hover = plainHover(trace);
  if (hover) {
    next.hovertemplate = hover;
  }
  return next;
}

function largestValue(data: any[]): number {
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

export function withSandwormDefaults<T extends Figure>(figure: T): T {
  const data = (figure.data ?? []).map(normalizeTrace);
  let layout = { ...figure.layout };

  if (data.some(t => t.type === "bar") && layout.barcornerradius === undefined) {
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
  const cartesian = data.some(t =>
    ["bar", "scatter", "scattergl"].includes(t.type ?? "scatter")
  );
  const valueAxis = data.some(t => t.orientation === "h") ? "xaxis" : "yaxis";
  if (
    cartesian &&
    !layout[valueAxis]?.tickformat &&
    !layout[valueAxis]?.hoverformat &&
    largestValue(data) >= 1000
  ) {
    layout[valueAxis] = { ...layout[valueAxis], hoverformat: ",.0f" };
  }

  return { ...figure, data, layout };
}
