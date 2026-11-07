import clsx from "clsx";
import { PiCaretLeft } from "react-icons/pi";

import { AppLink } from "@/components/AppLink";
import type { EntityPage, RowSplit } from "@/types";

import { BlockRenderer } from "./BlockRenderer";
import { EntityHeader } from "./EntityHeader";
import { InsightBanner } from "./InsightBanner";
import { KpiStrip } from "./KpiStrip";

const splitClassNames: Record<RowSplit, string> = {
  full: "grid-cols-1",
  "wide-narrow": "grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]",
};

type EntityScreenProps = { page: EntityPage; clientName: string };

export function EntityScreen({ page, clientName }: EntityScreenProps) {
  return (
    <div className="flex flex-col gap-6">
      <AppLink
        route="analysis"
        className="inline-flex items-center gap-1 self-start text-[13px] text-ink-400 transition-colors hover:text-ink-100"
      >
        <PiCaretLeft size={12} aria-hidden="true" />
        Analysis
      </AppLink>
      <EntityHeader
        kind={page.kind}
        name={page.name}
        tags={page.tags}
        summary={page.summary}
      />
      <KpiStrip label={`${page.name} at a glance`} kpis={page.kpis} />
      <InsightBanner insight={page.insight} clientName={clientName} />
      {page.rows.map(row => (
        <div
          key={row.id}
          className={clsx(
            "grid items-stretch gap-5",
            splitClassNames[row.split]
          )}
        >
          {row.blocks.map(block => (
            <BlockRenderer key={block.id} block={block} />
          ))}
        </div>
      ))}
      <p className="text-xs text-ink-400">
        Sandworm analysis of onchain data. Estimates, not financial advice.
      </p>
    </div>
  );
}
