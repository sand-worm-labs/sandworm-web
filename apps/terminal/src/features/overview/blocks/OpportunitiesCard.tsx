import clsx from "clsx";

import { AppLink } from "@/components/AppLink";
import { buttonClassName } from "@/components/Button";
import { Card, cardRowDividerClassName } from "@/components/Card";
import { ConfidenceMeter } from "@/features/opportunities/components/ConfidenceMeter";
import { OpportunityStatusIcon } from "@/features/opportunities/components/OpportunityStatusIcon";

import { BlockHeader } from "../components/BlockHeader";
import type { OpportunitiesBlock } from "../types";

export function OpportunitiesCard({ block }: { block: OpportunitiesBlock }) {
  const titleId = `${block.id}-title`;

  return (
    <Card aria-labelledby={titleId} className="px-4 pb-2.5 pt-[22px]">
      <div className="px-2 pb-2">
        <BlockHeader
          id={titleId}
          title={block.title}
          subtitle={block.subtitle}
          action={
            <AppLink
              route="opportunities"
              className={buttonClassName({
                variant: "link",
                className: "whitespace-nowrap font-medium",
              })}
            >
              All opportunities
            </AppLink>
          }
        />
      </div>
      {block.items.map(item => (
        <AppLink
          key={item.id}
          route="opportunity"
          className={clsx(
            "flex flex-wrap items-start gap-x-4 gap-y-2 rounded-xl px-2 py-3.5 transition-colors hover:bg-primary-tint-50 dark:hover:bg-dropdown-hover md:grid md:grid-cols-[14px_minmax(0,1fr)_140px_130px_84px]",
            cardRowDividerClassName
          )}
        >
          <OpportunityStatusIcon status={item.status} />
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="text-sm font-medium text-ink-100">
              {item.title}
            </span>
            <span className="text-[13px] text-ink-400">{item.summary}</span>
          </span>
          <span className="inline-flex h-[22px] items-center justify-self-start whitespace-nowrap rounded-md bg-hover-bg px-2 text-xs text-ink-400">
            {item.kind}
          </span>
          <span className="flex flex-col md:items-end">
            <span className="text-[15px] font-medium text-ink-100">
              {item.value}
            </span>
            <span className="text-xs text-ink-400">{item.valueLabel}</span>
          </span>
          <ConfidenceMeter confidence={item.confidence} />
        </AppLink>
      ))}
    </Card>
  );
}
