import type { Output } from "@sandworm/types";
import type { PlotlyFigure } from "@sandworm/ui/lib/plotly-figure";

// A notebook cell that drew one chart with the theme's `chart()` leaves three
// outputs: the title and legend as HTML, the Plotly figure, and a source note.
// The terminal draws such a cell itself, in its own type, with the figure alone
// and a title and legend read from that HTML (apps/jupyter sandworm_theme
// html.py `chart_head`, whose markup is fixed and escaped). A cell of any other
// shape is left to the notebook's own renderer.

export type ChartLegendItem = {
  name: string;
  color: string;
  isLine: boolean;
};

export type NativeChart = {
  title: string;
  legend: readonly ChartLegendItem[];
  figure: PlotlyFigure;
};

// What the cartesian bundle draws that a finding needs
const NATIVE_TRACES = new Set(["bar", "scatter"]);

const TITLE = /<h4 class="sw-chart-title">([\s\S]*?)<\/h4>/;
const LEGEND_KEY =
  /<span><i class="(ln)?" style="background:([^"]*)"><\/i>([\s\S]*?)<\/span>/g;
const COLOR = /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\))$/i;

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#x27;": "'",
};
const unescapeHtml = (text: string) =>
  text.replace(
    /&(amp|lt|gt|quot|#x27);/g,
    entity => ENTITIES[entity] ?? entity
  );

function readHead(html: string) {
  const title = TITLE.exec(html)?.[1];
  const legend = Array.from(html.matchAll(LEGEND_KEY)).map(
    ([, line, color, name]) => ({
      name: unescapeHtml(name ?? ""),
      color: unescapeHtml(color ?? ""),
      isLine: line === "ln",
    })
  );
  return {
    title: title === undefined ? "" : unescapeHtml(title),
    legend,
  };
}

const isFigure = (output: Output): output is Output & { type: "plotly" } =>
  output.type === "plotly";

// The chart a cell's outputs draw, or null when the terminal should leave the
// cell to the notebook's renderer: more than one figure, an HTML output that is
// not the chart's head or source note, a trace the bundle does not draw, or a
// figure with its own buttons, sliders or frames.
export function toNativeChart(outputs: readonly Output[]): NativeChart | null {
  const figures = outputs.filter(isFigure);
  if (figures.length !== 1) return null;

  let title = "";
  let legend: ChartLegendItem[] = [];
  const isDrawable = outputs.every(output => {
    switch (output.type) {
      case "plotly":
      case "stdio":
        return true;
      case "html": {
        if (output.html.includes('class="sw-chart-head"')) {
          ({ title, legend } = readHead(output.html));
          return true;
        }
        return output.html.includes('class="sw-note"');
      }
      default:
        return false;
    }
  });
  if (!isDrawable || legend.some(item => !COLOR.test(item.color))) return null;

  const { data, layout, frames } = figures[0] as PlotlyFigure;
  if (!Array.isArray(data) || data.length === 0 || !layout) return null;
  const isSupported =
    data.every(trace => NATIVE_TRACES.has(trace.type ?? "scatter")) &&
    !layout.updatemenus &&
    !layout.sliders &&
    !(Array.isArray(frames) && frames.length > 0);
  return isSupported
    ? { title, legend, figure: { data, layout, frames } }
    : null;
}
