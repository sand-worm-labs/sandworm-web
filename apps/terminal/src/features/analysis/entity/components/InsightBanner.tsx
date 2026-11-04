import { PiCaretRight } from "react-icons/pi";

import { AppLink } from "@/components/AppLink";

import type { EntityInsight } from "../types";

export function InsightBanner({
  insight,
  clientName,
}: {
  insight: EntityInsight;
  clientName: string;
}) {
  return (
    <section
      aria-labelledby="entity-insight"
      className="flex flex-wrap items-center justify-between gap-6 rounded-[22px] bg-primary-tint-75 p-6 ring-1 ring-inset ring-primary-tint-100 dark:bg-primary-910 dark:ring-border-tertiary"
    >
      <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-1.5">
        <span className="text-xs font-medium text-primary-700 dark:text-primary-200">
          What this means for {clientName}
        </span>
        <h2
          id="entity-insight"
          className="text-xl font-medium leading-snug text-ink-100"
        >
          {insight.heading}
        </h2>
        <p className="text-sm text-ink-500">{insight.text}</p>
      </div>
      <AppLink
        route={insight.action.route}
        className="inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-[10px] bg-block-surface px-3.5 text-[13px] font-medium text-primary-700 ring-1 ring-inset ring-primary-tint-100 transition-colors hover:bg-hover-bg dark:text-primary-200 dark:ring-border-tertiary"
      >
        {insight.action.label}
        <PiCaretRight size={12} aria-hidden="true" />
      </AppLink>
    </section>
  );
}
