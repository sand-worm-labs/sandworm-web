import clsx from "clsx";

import type { BriefingDetail } from "../types";

type BarBreakdownProps = {
  breakdown: NonNullable<BriefingDetail["breakdown"]>;
};

export function BarBreakdown({ breakdown }: BarBreakdownProps) {
  const description = breakdown.bars
    .map(bar => `${bar.label} ${bar.value}`)
    .join(", ");

  return (
    <div role="img" aria-label={description} className="flex flex-col gap-2.5">
      <span className="text-xs font-medium text-ink-400">
        {breakdown.title}
      </span>
      {breakdown.bars.map(bar => (
        <div
          key={bar.id}
          className="grid grid-cols-[96px_minmax(0,1fr)_48px] items-center gap-3"
        >
          <span
            className={clsx(
              "truncate",
              bar.isHighlighted ? "font-medium text-ink-100" : "text-ink-500"
            )}
          >
            {bar.label}
          </span>
          <span className="block h-2.5 overflow-hidden rounded-[5px] bg-hover-bg">
            <span
              className={clsx(
                "block h-2.5 rounded-[5px]",
                bar.isHighlighted ? "bg-primary" : "bg-primary-200"
              )}
              style={{ width: `${bar.share}%` }}
            />
          </span>
          <span
            className={clsx(
              "text-right",
              bar.isHighlighted ? "font-medium text-ink-100" : "text-ink-500"
            )}
          >
            {bar.value}
          </span>
        </div>
      ))}
    </div>
  );
}
