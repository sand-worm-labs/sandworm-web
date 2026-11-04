import { describe, expect, it } from "vitest";

import { barShare, buildLineChart, formatTick, LINE_CHART } from "./chart-math";
import type { YAxis } from "./types";

const yAxis: YAxis = {
  min: 0.5,
  max: 2.5,
  ticks: [0.5, 1.5, 2.5],
  decimals: 1,
  suffix: "%",
};

describe("buildLineChart", () => {
  const chart = buildLineChart(
    3,
    [{ id: "a", values: [0.5, 1.5, 2.5] }],
    yAxis
  );

  it("spreads the points evenly across the plot", () => {
    expect(chart.xs).toEqual([72, 324, 576]);
  });

  it("puts the axis minimum on the bottom and the maximum on the top", () => {
    expect(chart.ticks.map(tick => tick.y)).toEqual([220, 120, 20]);
  });

  it("builds the polyline and remembers where each series ends", () => {
    expect(chart.series[0]?.points).toBe("72,220 324,120 576,20");
    expect(chart.series[0]?.end).toEqual({ x: LINE_CHART.plotRight, y: 20 });
  });

  it("copes with a single point", () => {
    const single = buildLineChart(1, [{ id: "a", values: [1.5] }], yAxis);

    expect(single.xs).toEqual([72]);
    expect(single.series[0]?.end.y).toBe(120);
  });
});

describe("formatTick", () => {
  it("formats with the axis precision and suffix", () => {
    expect(formatTick(1, yAxis)).toBe("1.0%");
  });
});

describe("barShare", () => {
  it("is a whole percent of the maximum, kept inside 0 to 100", () => {
    expect(barShare(1.1, 2.4)).toBe(46);
    expect(barShare(5, 2.4)).toBe(100);
    expect(barShare(-1, 2.4)).toBe(0);
    expect(barShare(1, 0)).toBe(0);
  });
});
