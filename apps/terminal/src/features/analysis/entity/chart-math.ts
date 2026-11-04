import type { LineSeries, YAxis } from "./types";

export const LINE_CHART = {
  width: 720,
  height: 260,
  gridLeft: 48,
  gridRight: 600,
  plotLeft: 72,
  plotRight: 576,
  plotTop: 20,
  plotBottom: 220,
  labelX: 612,
} as const;

type Point = { x: number; y: number };

export type LineChartGeometry = {
  xs: readonly number[];
  ticks: readonly { value: number; y: number }[];
  series: readonly { id: string; points: string; end: Point }[];
};

const round = (value: number) => Number(value.toFixed(1));

export function buildLineChart(
  xCount: number,
  series: readonly Pick<LineSeries, "id" | "values">[],
  yAxis: YAxis
): LineChartGeometry {
  const { plotLeft, plotRight, plotTop, plotBottom } = LINE_CHART;
  const span = yAxis.max - yAxis.min;
  const stepX = xCount > 1 ? (plotRight - plotLeft) / (xCount - 1) : 0;

  const xAt = (index: number) => round(plotLeft + index * stepX);
  const yAt = (value: number) =>
    round(plotBottom - ((value - yAxis.min) / span) * (plotBottom - plotTop));

  return {
    xs: Array.from({ length: xCount }, (_, index) => xAt(index)),
    ticks: yAxis.ticks.map(value => ({ value, y: yAt(value) })),
    series: series.map(item => {
      const points = item.values.map((value, index) => ({
        x: xAt(index),
        y: yAt(value),
      }));

      return {
        id: item.id,
        points: points.map(point => `${point.x},${point.y}`).join(" "),
        end: points[points.length - 1] ?? { x: plotLeft, y: plotBottom },
      };
    }),
  };
}

export function formatTick(value: number, yAxis: YAxis): string {
  return `${value.toFixed(yAxis.decimals)}${yAxis.suffix}`;
}

export function barShare(value: number, max: number): number {
  if (max <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((value / max) * 100)));
}
