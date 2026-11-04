import { Card } from "@/components/Card";
import { SectionHeader } from "@/features/sections/SectionHeader";
import { Skeleton } from "@/components/Skeleton";

import { AnalystPanel } from "./components/AnalystPanel";
import { findBlock, type OverviewData } from "./types";

const SKELETON_ROW_WIDTHS = [
  "w-[78%]",
  "w-[64%]",
  "w-[82%]",
  "w-[58%]",
] as const;

type OverviewCalculatingProps = { data: OverviewData; clientName: string };

export function OverviewCalculating({
  data,
  clientName,
}: OverviewCalculatingProps) {
  const kpisBlock = findBlock(data.blocks, "kpis");
  const analystBlock = findBlock(data.blocks, "analyst");
  const panelTitles = [
    findBlock(data.blocks, "concentration")?.title,
    findBlock(data.blocks, "destinations")?.title,
  ].filter((title): title is string => title !== undefined);

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        current="overview"
        title="Overview"
        subtitle="First numbers arriving. Blocks appear as they finish."
      />
      <Card
        role="status"
        className="flex flex-col gap-3 px-6 py-5"
        aria-label="Calculating numbers"
      >
        <div className="flex flex-wrap justify-between gap-3">
          <span className="text-base font-medium text-ink-100">
            Calculating {clientName}&apos;s numbers
          </span>
          <span className="text-[13px] text-ink-400">About 2 hours left</span>
        </div>
        <span
          aria-hidden="true"
          className="block h-1 rounded-full bg-rainbow-gradient"
        />
        <span className="text-ink-400">
          {data.loadingNote} Each block appears as soon as it is ready, so you
          can leave this page.
        </span>
      </Card>
      {kpisBlock && (
        <Card
          aria-label="Key numbers, loading"
          className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] overflow-hidden"
        >
          {kpisBlock.items.map(item => (
            <div
              key={item.id}
              className="flex flex-col gap-1 border-r border-border-secondary px-6 py-5 last:border-r-0"
            >
              <span className="text-[13px] text-ink-400">{item.label}</span>
              <Skeleton className="mt-1 h-7 w-[62%] rounded-lg" />
              <Skeleton className="mt-1.5 h-3 w-[40%]" />
              <Skeleton className="mt-2 h-7 w-full rounded-lg" />
            </div>
          ))}
        </Card>
      )}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card
          aria-label="Briefing, loading"
          className="flex flex-col gap-4 px-6 py-[22px] lg:col-span-2"
        >
          <div>
            <span className="text-base font-medium text-ink-100">Briefing</span>
            <p className="mt-0.5 text-[13px] text-ink-400">
              Starts after your first full day of data
            </p>
          </div>
          {SKELETON_ROW_WIDTHS.map(width => (
            <div
              key={width}
              className="grid grid-cols-[96px_minmax(0,1fr)_72px] items-center gap-3.5"
            >
              <Skeleton className="h-[22px]" />
              <span className="flex flex-col gap-1.5">
                <Skeleton className={`h-3 ${width}`} />
                <Skeleton className="h-2.5 w-[50%]" />
              </span>
              <Skeleton className="h-3" />
            </div>
          ))}
        </Card>
        {analystBlock && (
          <AnalystPanel
            id="calculating-analyst"
            title={analystBlock.title}
            analyst={analystBlock.analyst}
            message={`${analystBlock.analyst.name} checks every number before it shows here.`}
          />
        )}
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {panelTitles.map(title => (
          <Card
            key={title}
            aria-label={`${title}, loading`}
            className="flex flex-col gap-3.5 px-6 py-[22px]"
          >
            <span className="text-base font-medium text-ink-100">{title}</span>
            <Skeleton className="h-7 rounded-lg" />
            <Skeleton className="h-3 w-[80%]" />
            <Skeleton className="h-3 w-[65%]" />
            <Skeleton className="h-3 w-[72%]" />
          </Card>
        ))}
      </div>
    </div>
  );
}
