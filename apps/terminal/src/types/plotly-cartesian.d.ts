// Plotly's cartesian bundle (bar, line, scatter) ships no types of its own. Only
// what the terminal calls is declared.
declare module "plotly.js/dist/plotly-cartesian.min" {
  const Plotly: {
    react: (
      root: HTMLElement,
      data: unknown[],
      layout?: unknown,
      config?: unknown
    ) => Promise<HTMLElement>;
    purge: (root: HTMLElement) => void;
    Plots: { resize: (root: HTMLElement) => Promise<unknown> };
  };
  export default Plotly;
}
