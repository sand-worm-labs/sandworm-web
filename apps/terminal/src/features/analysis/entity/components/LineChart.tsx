import clsx from "clsx";

import { buildLineChart, formatTick, LINE_CHART } from "../chart-math";
import type { EntityBlock, LineTone } from "../types";

import { SectionCard } from "./SectionCard";

type LineChartBlock = Extract<EntityBlock, { _tag: "lineChart" }>;

const toneClassNames: Record<LineTone, { stroke: string; fill: string }> = {
  primary: { stroke: "stroke-primary", fill: "fill-primary" },
  navy: { stroke: "stroke-ink-navy", fill: "fill-ink-navy" },
  sky: { stroke: "stroke-sky-600", fill: "fill-sky-600" },
  positive: { stroke: "stroke-emerald-700", fill: "fill-emerald-700" },
};

export function LineChart({ block }: { block: LineChartBlock }) {
  const { yAxis, series, xLabels } = block;
  const geometry = buildLineChart(xLabels.length, series, yAxis);

  return (
    <SectionCard id={block.id} title={block.title} subtitle={block.subtitle}>
      <svg
        viewBox={`0 0 ${LINE_CHART.width} ${LINE_CHART.height}`}
        role="img"
        aria-label={block.summary}
        className="block h-auto w-full"
      >
        {geometry.ticks.map(tick => (
          <g key={tick.value}>
            <path
              d={`M${LINE_CHART.gridLeft} ${tick.y}H${LINE_CHART.gridRight}`}
              className="stroke-border-secondary"
              fill="none"
              strokeWidth={1}
            />
            <text
              x={40}
              y={tick.y + 4}
              textAnchor="end"
              fontSize={12}
              className="fill-ink-400"
            >
              {formatTick(tick.value, yAxis)}
            </text>
          </g>
        ))}
        {geometry.xs.map((x, index) => (
          <text
            key={xLabels[index]}
            x={x}
            y={248}
            textAnchor="middle"
            fontSize={12}
            className="fill-ink-400"
          >
            {xLabels[index]}
          </text>
        ))}
        {[...series].reverse().map(item => {
          const drawn = geometry.series.find(line => line.id === item.id);
          if (!drawn) return null;
          const tone = toneClassNames[item.tone];

          return (
            <g key={item.id}>
              <polyline
                points={drawn.points}
                fill="none"
                strokeWidth={item.isHighlighted ? 2.5 : 2}
                strokeDasharray={item.isDashed ? "5 5" : undefined}
                strokeLinejoin="round"
                strokeLinecap="round"
                className={tone.stroke}
              />
              <circle
                cx={drawn.end.x}
                cy={drawn.end.y}
                r={3.5}
                className={tone.fill}
              />
              <text
                x={LINE_CHART.labelX}
                y={drawn.end.y + 4}
                fontSize={12}
                className={clsx(
                  item.isHighlighted
                    ? "fill-ink-100 font-medium"
                    : "fill-ink-500"
                )}
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>
    </SectionCard>
  );
}
