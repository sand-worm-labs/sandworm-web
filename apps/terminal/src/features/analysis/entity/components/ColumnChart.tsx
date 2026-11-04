import { barShare } from "../chart-math";
import type { EntityBlock } from "../types";

import { SectionCard } from "./SectionCard";

type ColumnChartBlock = Extract<EntityBlock, { _tag: "columnChart" }>;

const BAR_AREA_PX = 150;

export function ColumnChart({ block }: { block: ColumnChartBlock }) {
  const max = Math.max(...block.bars.map(bar => bar.value));
  const lastId = block.bars[block.bars.length - 1]?.id;
  const summary = `${block.title}: ${block.bars
    .map(bar => `${bar.label} ${bar.valueLabel}`)
    .join(", ")}`;

  return (
    <SectionCard id={block.id} title={block.title} subtitle={block.subtitle}>
      <div
        role="img"
        aria-label={summary}
        className="flex h-[200px] items-end gap-3.5 border-b border-border-secondary pt-2"
      >
        {block.bars.map(bar => {
          const isLast = bar.id === lastId;
          return (
            <div
              key={bar.id}
              className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5"
            >
              <span
                className={
                  isLast
                    ? "whitespace-nowrap text-xs font-medium text-ink-100"
                    : "whitespace-nowrap text-xs text-ink-400"
                }
              >
                {bar.valueLabel}
              </span>
              <span
                className={
                  isLast
                    ? "block w-full max-w-14 rounded-t-lg rounded-b-sm bg-primary"
                    : "block w-full max-w-14 rounded-t-lg rounded-b-sm bg-primary-200"
                }
                style={{
                  height: `${(barShare(bar.value, max) / 100) * BAR_AREA_PX}px`,
                }}
              />
            </div>
          );
        })}
      </div>
      <div aria-hidden="true" className="-mt-2 flex gap-3.5">
        {block.bars.map(bar => (
          <span
            key={bar.id}
            className="min-w-0 flex-1 text-center text-xs text-ink-400"
          >
            {bar.label}
          </span>
        ))}
      </div>
    </SectionCard>
  );
}
