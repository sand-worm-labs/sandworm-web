// A Plotly figure as a notebook stores it: JSON with open-ended keys. Only the
// fields the renderer reads or sets are named here; everything else passes
// through untouched.

type Open = { [key: string]: unknown };

export type PlotlyAxis = Open & { tickformat?: string; hoverformat?: string };

export type PlotlyTrace = Open & {
  type?: string;
  name?: unknown;
  orientation?: string;
  showlegend?: boolean;
  hovertemplate?: unknown;
  offsetgroup?: string;
  x?: unknown;
  y?: unknown;
  xgap?: number;
  ygap?: number;
  colorscale?: unknown;
  coloraxis?: unknown;
  marker?: Open & {
    cornerradius?: number;
    line?: Open & { width?: number; color?: string };
  };
  tiling?: Open & { pad?: number };
  pathbar?: Open & { visible?: boolean };
};

type PlotlyHoverLabel = Open & {
  bgcolor?: string;
  bordercolor?: string;
  font?: Open;
};

export type PlotlyLayout = Open & {
  title?: string | (Open & { text?: string });
  showlegend?: boolean;
  legend?: Open & {
    orientation?: string;
    y?: number;
    title?: Open & { text?: string };
  };
  margin?: Open & { t?: number };
  barmode?: string;
  barcornerradius?: number;
  hovermode?: string;
  hoverlabel?: PlotlyHoverLabel;
  xaxis?: PlotlyAxis;
  yaxis?: PlotlyAxis;
  template?: Open & { layout?: Open & { hoverlabel?: PlotlyHoverLabel } };
};

export type PlotlyFigure = {
  data: PlotlyTrace[];
  layout: PlotlyLayout;
  frames?: unknown;
};
