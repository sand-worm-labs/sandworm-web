const WIDTH = 200;
const HEIGHT = 28;
const PADDING_TOP = 3;
const PADDING_BOTTOM = 3;

export const SPARKLINE_VIEWBOX = `0 0 ${WIDTH} ${HEIGHT}`;

export function toSparklinePoints(series: readonly number[]): string {
  if (series.length < 2) return "";

  const max = Math.max(...series);
  const min = Math.min(...series);
  const range = max - min || 1;
  const plotHeight = HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const step = WIDTH / (series.length - 1);

  return series
    .map((value, index) => {
      const x = (index * step).toFixed(1);
      const y = (
        HEIGHT -
        PADDING_BOTTOM -
        ((value - min) / range) * plotHeight
      ).toFixed(1);
      return `${x},${y}`;
    })
    .join(" ");
}
