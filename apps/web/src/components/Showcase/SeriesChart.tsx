// A small chart of one series over time, drawn as SVG on the server: no chart library, no
// client code. It follows the theme through CSS variables, and scales with its container.
import type { SeriesPoint } from "@/lib/protocolStats";

// =====================================
// ⬢  Constants
// =====================================
const WIDTH = 720;
const HEIGHT = 260;
const PAD = { left: 60, right: 12, top: 12, bottom: 30 };
const Y_TICKS = 4;
const X_TICKS = 4;

// =====================================
// ⬢  Utils
// =====================================
// A round number at or above the maximum, so the top gridline is a figure a reader can say.
function niceMax(max: number): number {
  if (max <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(max));
  const step = [1, 2, 4, 5, 10].find(s => s * magnitude >= max) ?? 10;
  return step * magnitude;
}

const monthYear = (seconds: number) =>
  new Date(seconds * 1000).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

// =====================================
// ⬢  SeriesChart
// =====================================
export function SeriesChart({
  points,
  variant,
  format,
  label,
}: {
  points: SeriesPoint[];
  // area: a level over time, such as TVL. bars: an amount per day, such as fees.
  variant: "area" | "bars";
  // Writes a value for an axis, such as $3.3M.
  format: (value: number) => string;
  // What the chart shows, for screen readers.
  label: string;
}) {
  if (points.length < 2) {
    return (
      <p className="py-10 text-center text-sm text-ink-400">
        Not enough history to draw yet.
      </p>
    );
  }

  const top = niceMax(Math.max(...points.map(p => p[1])));
  const plotW = WIDTH - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const first = points[0]![0];
  const span = points[points.length - 1]![0] - first || 1;

  const x = (t: number) => PAD.left + ((t - first) / span) * plotW;
  const y = (v: number) => PAD.top + plotH - (v / top) * plotH;

  const line = points.map(p => `${x(p[0]).toFixed(1)},${y(p[1]).toFixed(1)}`);
  const baseline = y(0).toFixed(1);
  const area = `M${x(first).toFixed(1)},${baseline} L${line.join(" L")} L${x(points[points.length - 1]![0]).toFixed(1)},${baseline} Z`;
  const barW = Math.max(1, (plotW / points.length) * 0.7);

  const yTicks = Array.from(
    { length: Y_TICKS + 1 },
    (_, i) => (top / Y_TICKS) * i
  );
  const xTicks = Array.from(
    { length: X_TICKS },
    (_, i) => points[Math.round(((points.length - 1) / (X_TICKS - 1)) * i)]![0]
  );

  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="h-auto w-full"
    >
      {yTicks.map(value => (
        <g key={value}>
          <line
            x1={PAD.left}
            x2={WIDTH - PAD.right}
            y1={y(value)}
            y2={y(value)}
            stroke="hsl(var(--border-tertiary))"
            strokeWidth="1"
            opacity={value === 0 ? 1 : 0.6}
          />
          <text
            x={PAD.left - 8}
            y={y(value) + 4}
            textAnchor="end"
            fontSize="13"
            fill="var(--ink-400)"
          >
            {format(value)}
          </text>
        </g>
      ))}

      {variant === "area" ? (
        <>
          <path d={area} fill="hsl(var(--primary))" opacity="0.18" />
          <polyline
            points={line.join(" ")}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </>
      ) : (
        points.map(p => (
          <rect
            key={p[0]}
            x={x(p[0]) - barW / 2}
            y={y(p[1])}
            width={barW}
            height={Math.max(0, y(0) - y(p[1]))}
            fill="hsl(var(--primary))"
            opacity="0.85"
          />
        ))
      )}

      {xTicks.map((t, i) => (
        <text
          key={t}
          x={x(t)}
          y={HEIGHT - 9}
          textAnchor={
            i === 0 ? "start" : i === xTicks.length - 1 ? "end" : "middle"
          }
          fontSize="13"
          fill="var(--ink-400)"
        >
          {monthYear(t)}
        </text>
      ))}
    </svg>
  );
}
