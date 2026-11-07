import { Card } from "@sandworm/ui/kit/card";
import { ROW_HOVER_CLASSNAME } from "@sandworm/ui/kit/interactive";
import { Pill } from "@sandworm/ui/kit/pill";

import { AppLink } from "@/components/AppLink";
import type { EntityBlock } from "@/features/analysis/entity/types";

type ReportListBlock = Extract<EntityBlock, { _tag: "reportList" }>;

export function ReportList({ block }: { block: ReportListBlock }) {
  const titleId = `${block.id}-title`;

  return (
    <Card aria-labelledby={titleId} className="px-2 pb-2.5 pt-[22px]">
      <h2 id={titleId} className="px-3 pb-2 text-base font-medium text-ink-100">
        {block.title}
      </h2>
      {block.items.map((item, index) => (
        <div
          key={item.id}
          className={index > 0 ? "border-t border-border-secondary" : undefined}
        >
          <AppLink
            route="report"
            className={`${ROW_HOVER_CLASSNAME} grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-3 py-3.5`}
          >
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="flex items-center gap-2">
                <span className="text-sm font-medium text-ink-100">
                  {item.title}
                </span>
                {item.isNew && <Pill>New</Pill>}
              </span>
              {item.line && (
                <span className="text-[13px] text-ink-400">{item.line}</span>
              )}
            </span>
            <span className="whitespace-nowrap text-xs text-ink-400">
              {item.when}
            </span>
          </AppLink>
        </div>
      ))}
    </Card>
  );
}
