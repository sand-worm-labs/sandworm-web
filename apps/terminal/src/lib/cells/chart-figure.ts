import { toDarkFigure } from "@sandworm/ui/lib/plotly-dark";
import { withSandwormDefaults } from "@sandworm/ui/lib/plotly-defaults";
import type { PlotlyFigure } from "@sandworm/ui/lib/plotly-figure";

export const CHART_HEIGHT = 300;

// The theme's watermark is two template items, the mark and the wordmark, with one
// name. Hiding them by name leaves anything else the figure has of its own.
const hideWatermark = (own: unknown) => [
  ...(Array.isArray(own) ? own : []),
  { templateitemname: "sandworm-watermark", visible: false },
];

type FigureOptions = { isDark: boolean; fontFamily: string };

// The figure as the terminal draws it: the notebook renderer's defaults (tooltips,
// legend repairs, stacked bars) and dark colours, in the terminal's own font, at a
// fixed height, with no zoom and no watermark.
export function terminalFigure(
  figure: PlotlyFigure,
  { isDark, fontFamily }: FigureOptions
): PlotlyFigure {
  // A copy, because Plotly writes into what it draws and query results are frozen
  const themed = withSandwormDefaults(structuredClone(figure));
  const { data, layout } = isDark ? toDarkFigure(themed) : themed;

  return {
    data,
    layout: {
      ...layout,
      autosize: true,
      width: undefined,
      height: CHART_HEIGHT,
      dragmode: false,
      font: { ...(layout.font as object | undefined), family: fontFamily },
      hoverlabel: {
        ...layout.hoverlabel,
        font: { ...layout.hoverlabel?.font, family: fontFamily },
      },
      images: hideWatermark(layout.images),
      annotations: hideWatermark(layout.annotations),
    },
  };
}
