import { SPARKLINE_VIEWBOX, toSparklinePoints } from "@/lib/sparkline";

type SparklineProps = { series: readonly number[]; className?: string };

export function Sparkline({ series, className }: SparklineProps) {
  return (
    <svg
      width="100%"
      height="28"
      viewBox={SPARKLINE_VIEWBOX}
      preserveAspectRatio="none"
      aria-hidden="true"
      className={className}
    >
      <polyline
        points={toSparklinePoints(series)}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
