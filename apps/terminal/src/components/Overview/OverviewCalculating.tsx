import { Card } from "@sandworm/ui/kit/card";
import { Skeleton } from "@sandworm/ui/kit/skeleton";

import { SectionHeader } from "@/components/Sections/SectionHeader";
import {
  findBlock,
  type KpisBlock,
  type OverviewData,
} from "@/lib/overview/types";

import { BlockHeader } from "./BlockHeader";

// Varied widths so the loading rows read as text, not as a grid of bars.
const BRIEFING_ROW_WIDTHS = ["w-[78%]", "w-[64%]", "w-[82%]", "w-[58%]"];

type OverviewCalculatingProps = { data: OverviewData; clientName: string };

export function OverviewCalculating({
  data,
  clientName,
}: OverviewCalculatingProps) {
  const kpis = findBlock(data.blocks, "kpis");

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        current="overview"
        title="Overview"
        subtitle="First numbers arriving. Blocks appear as they finish."
      />
      <CalculatingStatus clientName={clientName} note={data.loadingNote} />
      {kpis && <KpisSkeleton block={kpis} />}
      <BriefingSkeleton />
    </div>
  );
}

function CalculatingStatus({
  clientName,
  note,
}: {
  clientName: string;
  note: string;
}) {
  return (
    <Card role="status" className="flex flex-col gap-3 px-6 py-5">
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
        {note} Each block appears as soon as it is ready, so you can leave this
        page.
      </span>
    </Card>
  );
}

function KpisSkeleton({ block }: { block: KpisBlock }) {
  return (
    <Card
      aria-label="Key numbers, loading"
      className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] overflow-hidden"
    >
      {block.items.map(item => (
        <div
          key={item.id}
          className="flex flex-col gap-1 border-r border-border-secondary px-6 py-5 last:border-r-0"
        >
          <span className="text-[13px] text-ink-400">{item.label}</span>
          <Skeleton className="mt-1 h-7 w-[62%] rounded-lg" />
          <Skeleton className="mt-1.5 h-3 w-[40%]" />
        </div>
      ))}
    </Card>
  );
}

function BriefingSkeleton() {
  const titleId = "briefing-loading-title";

  return (
    <Card
      aria-labelledby={titleId}
      className="flex flex-col gap-4 px-6 py-[22px]"
    >
      <BlockHeader
        id={titleId}
        title="Briefing"
        subtitle="Starts after your first full day of data"
      />
      {BRIEFING_ROW_WIDTHS.map(width => (
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
  );
}
