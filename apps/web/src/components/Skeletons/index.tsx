import type React from "react";

import { cn } from "@/lib/utils";

// =====================================
// ⬢ Shared skeleton primitive
// =====================================
export function Shimmer({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      className={cn(
        "rounded-md animate-pulse bg-black/5 dark:bg-white/10",
        className
      )}
    />
  );
}

// =====================================
// ⬢ Output skeletons
// Shapes that hint at what is loading (a chart, a table), instead of one
// featureless grey slab. Same tokens as the sidebar's skeleton.
// =====================================
const BLOCK = "bg-base-300 dark:bg-base-700 animate-pulse";
const BAR_HEIGHTS = [38, 62, 48, 80, 56, 70, 44];
const Y_TICKS = ["top", "upper", "lower", "bottom"];
const COLUMN_WIDTHS = [28, 20, 24, 16];
const ROW_IDS = ["r1", "r2", "r3", "r4", "r5", "r6", "r7", "r8"];

export function ChartSkeleton({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="status"
      {...rest}
      className={cn("flex flex-col gap-5 rounded-lg px-6 pt-5 pb-6", className)}
    >
      <div className={cn("h-3.5 w-1/3 rounded-md", BLOCK)} />
      <div className="flex flex-1 items-stretch gap-4 min-h-[8rem]">
        <div className="flex flex-col justify-between py-1">
          {Y_TICKS.map(tick => (
            <div key={tick} className={cn("h-2 w-6 rounded", BLOCK)} />
          ))}
        </div>
        <div className="flex flex-1 items-end gap-3 border-b border-l border-border-secondary dark:border-border-tertiary px-3">
          {BAR_HEIGHTS.map((height, order) => (
            <div
              key={`bar-${height}`}
              className={cn("flex-1 rounded-t-md", BLOCK)}
              style={{
                height: `${height}%`,
                animationDelay: `${order * 90}ms`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({
  rows = 5,
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { rows?: number }) {
  return (
    <div
      role="status"
      {...rest}
      className={cn(
        "rounded-lg border border-border-secondary dark:border-border-tertiary overflow-hidden",
        className
      )}
    >
      <div className="flex gap-6 px-4 py-3 border-b border-border-secondary dark:border-border-tertiary">
        {COLUMN_WIDTHS.map(width => (
          <div
            key={`head-${width}`}
            className={cn("h-3 rounded", BLOCK)}
            style={{ width: `${width}%` }}
          />
        ))}
      </div>
      {ROW_IDS.slice(0, rows).map((rowId, row) => (
        <div key={rowId} className="flex gap-6 px-4 py-3">
          {COLUMN_WIDTHS.map(width => (
            <div
              key={`${rowId}-${width}`}
              className={cn("h-2.5 rounded", BLOCK)}
              style={{ width: `${width}%`, animationDelay: `${row * 80}ms` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
