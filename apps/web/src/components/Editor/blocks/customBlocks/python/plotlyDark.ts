// =====================================
// ⬢ Dark mode for Plotly results
// =====================================
// A notebook stores its Plotly figures once, with the colors the Python theme
// wrote into them (apps/jupyter/sandworm_theme/tokens.py). The reader's theme is
// not known at run time, so dark mode is applied here, when the figure is drawn:
// every color the theme (or a chart that reuses its palette) wrote is swapped for
// its dark counterpart. Backgrounds are already transparent, so the chart sits on
// whatever surface the tile or block provides.
//
// Keep this table in step with DARK in sandworm_theme/tokens.py.

const TILE_SURFACE = "#272726";
const LIGHT_INK = "#f3f0f5";

const DARK_COLORS: Record<string, string> = {
  // Text, rules and surfaces. White is left alone on purpose: it is mostly text
  // on a colored fill (treemap labels), which must stay white.
  "#17101c": LIGHT_INK, // INK
  "#1b1320": LIGHT_INK, // INK, as hard-coded in older notebook helpers
  "#42364c": "#cfc8d6", // INK_2
  "#6f6478": "#a5a5a4", // MUTED
  "#e9e2ed": "#40403e", // RULE: gridlines and axis lines
  "#faf6fc": "#2f2f2e", // SHADE: lightest step of a sequential scale
  "#fde7f4": "#3b2433", // lightest pink of a heatmap
  "rgba(255,255,255,0.85)": "rgba(39,39,38,0.85)", // label backgrounds
  // Series colors too dark to read on a dark surface
  "#84185c": "#c1428a",
  "#4b2e83": "#9a7bdb",
};

// Big numeric arrays carry no colors; skip them rather than walk every point.
const MAX_SCANNED_ARRAY = 2000;

function endsWith(path: string[], tail: string[]): boolean {
  return (
    path.length >= tail.length &&
    tail.every((key, i) => path[path.length - tail.length + i] === key)
  );
}

function mapColor(value: string, path: string[]): string {
  const key = value.trim().toLowerCase();
  // A white line between tiles or bars is a separator: on dark it should be the
  // surface color, or it shows as a bright grid.
  if (key === "#ffffff" && endsWith(path, ["marker", "line", "color"])) {
    return TILE_SURFACE;
  }
  return DARK_COLORS[key] ?? value;
}

function walk<T>(value: T, path: string[]): T {
  if (typeof value === "string") {
    return mapColor(value, path) as T;
  }
  if (Array.isArray(value)) {
    if (value.length > MAX_SCANNED_ARRAY && typeof value[0] === "number") {
      return value;
    }
    return value.map(item => walk(item, path)) as T;
  }
  if (value && typeof value === "object" && !ArrayBuffer.isView(value)) {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      out[key] = walk(item, [...path, key]);
    }
    return out as T;
  }
  return value;
}

// The theme's tooltip is a dark box with white text. Recoloring both to their
// dark counterparts would leave white text on a near-white box, so the tooltip
// is set outright: a light box with dark text, in the figure and its template.
function withDarkTooltip(layout: any): any {
  const tooltip = (own: any = {}) => ({
    ...own,
    bgcolor: LIGHT_INK,
    bordercolor: LIGHT_INK,
    font: { ...own.font, color: TILE_SURFACE },
  });
  const next = { ...layout, hoverlabel: tooltip(layout?.hoverlabel) };
  if (layout?.template?.layout) {
    next.template = {
      ...layout.template,
      layout: {
        ...layout.template.layout,
        hoverlabel: tooltip(layout.template.layout.hoverlabel),
      },
    };
  }
  return next;
}

export function toDarkFigure<T extends { data: any; layout: any }>(
  figure: T
): T {
  return {
    ...figure,
    data: walk(figure.data, []),
    layout: withDarkTooltip(walk(figure.layout, [])),
  };
}
