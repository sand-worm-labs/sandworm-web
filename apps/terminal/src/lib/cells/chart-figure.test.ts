import type { PlotlyFigure } from "@sandworm/ui/lib/plotly-figure";
import { describe, expect, it } from "vitest";

import { CHART_HEIGHT, terminalFigure } from "./chart-figure";

const figure = (): PlotlyFigure => ({
  data: [
    { type: "bar", name: "A", x: ["Q1"], y: [0.4], offsetgroup: "A" },
    { type: "bar", name: "B", x: ["Q1"], y: [0.6], offsetgroup: "B" },
  ],
  layout: {
    barmode: "relative",
    width: 900,
    font: { color: "#17101C", family: "Bricolage Grotesque" },
    annotations: [{ text: "Peak" }],
    hoverlabel: { font: { size: 13 } },
  },
});

const light = { isDark: false, fontFamily: "Moderat" };

describe("terminalFigure", () => {
  it("fits the figure to the tile: fixed height, container width, no zoom, no watermark", () => {
    const { layout } = terminalFigure(figure(), light);

    expect(layout).toMatchObject({
      autosize: true,
      width: undefined,
      height: CHART_HEIGHT,
      dragmode: false,
      images: [{ templateitemname: "sandworm-watermark", visible: false }],
    });
  });

  it("hides the watermark's mark and wordmark and keeps the figure's own annotations", () => {
    const { layout } = terminalFigure(figure(), light);

    expect(layout.annotations).toEqual([
      { text: "Peak" },
      { templateitemname: "sandworm-watermark", visible: false },
    ]);
  });

  it("draws in the terminal's font, tooltips included", () => {
    const { layout } = terminalFigure(figure(), light);

    expect(layout.font).toMatchObject({ family: "Moderat", color: "#17101C" });
    expect(layout.hoverlabel?.font).toMatchObject({
      family: "Moderat",
      size: 13,
    });
  });

  it("applies the notebook renderer's defaults", () => {
    const { data, layout } = terminalFigure(figure(), light);

    expect(data.map(trace => trace.offsetgroup)).toEqual([
      undefined,
      undefined,
    ]);
    expect(layout.hovermode).toBe("x unified");
  });

  it("swaps in the dark colours in dark mode", () => {
    const { layout } = terminalFigure(figure(), { ...light, isDark: true });

    expect(layout.font).toMatchObject({ color: "#f3f0f5" });
  });

  it("draws a frozen figure without touching it", () => {
    const frozen = Object.freeze(
      JSON.parse(JSON.stringify(figure()))
    ) as PlotlyFigure;
    frozen.data.forEach(trace => Object.freeze(trace));

    expect(() => terminalFigure(frozen, light)).not.toThrow();
    expect(frozen.layout.height).toBeUndefined();
  });
});
