import { InitialsAvatar } from "@sandworm/ui/kit/initials-avatar";

import { AppLink } from "@/components/AppLink";
import type { AnalysisHighlight } from "@/features/analysis/types";

import { HighlightTag } from "./HighlightTag";

export function HighlightCards({
  highlights,
}: {
  highlights: readonly AnalysisHighlight[];
}) {
  return (
    <section aria-labelledby="analysis-new" className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="analysis-new" className="text-base font-medium text-ink-100">
          New for you
        </h2>
        <span className="text-[13px] text-ink-400">
          {highlights.length} this week
        </span>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
        {highlights.map(item => (
          <AppLink
            key={item.id}
            route="report"
            className="flex min-h-[168px] flex-col gap-2.5 rounded-[22px] border border-hover-border bg-block-surface p-5 block-shadow-soft transition-colors hover:bg-hover-bg dark:hover:bg-sidebar-hover"
          >
            <span className="flex items-center justify-between gap-2">
              <HighlightTag tag={item.tag} />
              <span className="text-xs text-ink-400">{item.when}</span>
            </span>
            <span className="text-[15px] font-medium leading-snug text-ink-100">
              {item.title}
            </span>
            <span className="text-[13px] text-ink-400">{item.line}</span>
            <span className="mt-auto flex items-center gap-2 text-[13px] font-medium text-ink-100">
              <InitialsAvatar initials={item.entity.charAt(0)} size="sm" />
              {item.entity}
            </span>
          </AppLink>
        ))}
      </div>
    </section>
  );
}
