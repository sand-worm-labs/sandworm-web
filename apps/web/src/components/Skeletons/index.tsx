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

// =====================================
// ⬢ Dashboard skeletons
// Shaped like a dashboard (a title, a row of figure cards, then panels with a toolbar and a plot), so
// what loads in has about the same shape and the page does not jump. They show after a short beat from
// CSS alone (see .skeleton-delayed), so they paint before the page's JavaScript arrives.
// =====================================
const CARD =
  "rounded-xl border border-border-secondary dark:border-border-tertiary bg-base-100 dark:bg-block-surface";
const KPI_IDS = ["k1", "k2", "k3", "k4"];

export function KpiRowSkeleton({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="status"
      aria-label="Loading figures"
      {...rest}
      className={cn(
        "grid w-full grid-cols-2 gap-3 sm:grid-cols-4 min-h-[6rem]",
        className
      )}
    >
      {KPI_IDS.map((id, order) => (
        <div key={id} className={cn(CARD, "p-4")}>
          <div
            className={cn("h-2.5 w-1/2 rounded", BLOCK)}
            style={{ animationDelay: `${order * 90}ms` }}
          />
          <div
            className={cn("mt-3 h-6 w-3/4 rounded-md", BLOCK)}
            style={{ animationDelay: `${order * 90}ms` }}
          />
        </div>
      ))}
    </div>
  );
}

function SectionHeadingSkeleton({ width }: { width: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className={cn("h-4 rounded", BLOCK, width)} />
      <div className="h-px flex-1 bg-border-secondary dark:bg-border-tertiary" />
    </div>
  );
}

function PanelSkeleton({ plotHeight }: { plotHeight: string }) {
  return (
    <div className={cn(CARD, "overflow-hidden")}>
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-border-secondary dark:border-border-tertiary">
        {["a", "b", "c", "d"].map(id => (
          <div key={id} className={cn("h-7 w-16 rounded-full", BLOCK)} />
        ))}
      </div>
      <div className={cn("mx-4 mt-4 h-4 w-2/3 rounded", BLOCK)} />
      <ChartSkeleton className={plotHeight} aria-label="Loading chart" />
    </div>
  );
}

export function DashboardPageSkeleton({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading dashboard"
      className={cn(
        "skeleton-delayed w-full px-4 py-8 lg:px-[76px] space-y-8",
        className
      )}
    >
      <div className={cn("h-9 w-64 max-w-full rounded-lg", BLOCK)} />
      <div className="space-y-4">
        <SectionHeadingSkeleton width="w-40" />
        <KpiRowSkeleton />
      </div>
      <div className="space-y-4">
        <SectionHeadingSkeleton width="w-48" />
        <PanelSkeleton plotHeight="h-72" />
      </div>
      <div className="space-y-4">
        <SectionHeadingSkeleton width="w-36" />
        <PanelSkeleton plotHeight="h-64" />
      </div>
    </div>
  );
}

// A stand-in for the public page's top bar (56px) and the "Read-only preview" strip under it (37px), so
// the page does not jump when the real ones arrive.
export function PublicHeaderSkeleton() {
  return (
    <div aria-hidden="true" className="shrink-0">
      <div className="flex h-14 items-center justify-between border-b border-border-secondary dark:border-border-tertiary px-5">
        <div className={cn("h-6 w-36 rounded-md", BLOCK)} />
        <div className="flex items-center gap-3">
          <div className={cn("h-8 w-24 rounded-lg", BLOCK)} />
          <div className={cn("h-8 w-8 rounded-full", BLOCK)} />
          <div className={cn("h-8 w-20 rounded-lg", BLOCK)} />
        </div>
      </div>
      <div className="h-[37px] border-b border-border-secondary dark:border-border-tertiary" />
    </div>
  );
}
