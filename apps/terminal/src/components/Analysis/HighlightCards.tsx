import { ReportLink } from "@/components/ReportLink";
import { SubjectAvatar } from "@/components/Subject/SubjectAvatar";
import type { AnalysisHighlight } from "@/types";

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
      <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-[repeat(auto-fit,minmax(260px,1fr))] md:gap-4 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
        {highlights.map(item => (
          <ReportLink
            key={item.id}
            url={item.url}
            className="flex min-h-[168px] w-[82%] shrink-0 snap-start flex-col md:w-auto gap-2.5 rounded-[22px] border border-hover-border bg-block-surface p-5 block-shadow-soft transition-colors hover:bg-hover-bg dark:hover:bg-sidebar-hover"
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
              <SubjectAvatar name={item.entity} icon={item.icon} size="sm" />
              {item.entity}
            </span>
          </ReportLink>
        ))}
      </div>
    </section>
  );
}
