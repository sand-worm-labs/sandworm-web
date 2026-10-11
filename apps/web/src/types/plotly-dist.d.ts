// react-plotly.js draws with this bundle; the app asks it for the chart as an image.
// @types/plotly.js types the package root, not this file, so declare the one call used.
declare module "plotly.js/dist/plotly" {
  interface ToImageOptions {
    format: "png" | "jpeg" | "webp" | "svg";
    width?: number;
    height?: number;
    scale?: number;
  }

  const Plotly: {
    toImage(root: HTMLElement, options: ToImageOptions): Promise<string>;
  };

  export default Plotly;
}
