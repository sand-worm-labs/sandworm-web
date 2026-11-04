import clsx from "clsx";

import type { BarTone, EntityBlock } from "../types";

import { SectionCard } from "./SectionCard";

type BarListBlock = Extract<EntityBlock, { _tag: "barList" }>;

const barClassNames: Record<BarTone, string> = {
  primary: "bg-primary",
  navy: "bg-ink-navy",
  slate: "bg-slate-400 dark:bg-slate-500",
  muted: "bg-border",
  positive: "bg-emerald-700",
};

export function BarList({ block }: { block: BarListBlock }) {
  const summary = `${block.title}: ${block.rows
    .map(row => `${row.label} ${row.valueLabel}`)
    .join(", ")}`;

  return (
    <SectionCard id={block.id} title={block.title} subtitle={block.subtitle}>
      <div role="img" aria-label={summary} className="flex flex-col gap-3.5">
        {block.rows.map(row => (
          <div
            key={row.id}
            className="grid items-center gap-3.5"
            style={{
              gridTemplateColumns: `${block.labelWidth}px minmax(0, 1fr) ${block.valueWidth}px`,
            }}
          >
            <span
              className={
                row.isHighlighted ? "font-medium text-ink-100" : "text-ink-500"
              }
            >
              {row.label}
            </span>
            <span className="block h-3 overflow-hidden rounded-md bg-hover-bg">
              <span
                className={clsx(
                  "block h-3 rounded-md",
                  barClassNames[row.tone]
                )}
                style={{ width: `${row.share}%` }}
              />
            </span>
            <span
              className={clsx(
                "text-right",
                row.isHighlighted ? "font-medium text-ink-100" : "text-ink-500"
              )}
            >
              {row.valueLabel}
            </span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
