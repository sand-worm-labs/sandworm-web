import clsx from "clsx";
import { Card, cardRowDividerClassName } from "@sandworm/ui/kit/card";
import { ROW_HOVER_CLASSNAME } from "@sandworm/ui/kit/interactive";

import { AppLink } from "@/components/AppLink";
import { BlockHeader } from "@/components/Overview/BlockHeader";
import type { GapsBlock } from "@/types";

export function GapsCard({ block }: { block: GapsBlock }) {
  const titleId = `${block.id}-title`;

  return (
    <Card bleed aria-labelledby={titleId} className="px-3 pb-2.5 pt-[22px]">
      <div className="px-3 pb-2">
        <BlockHeader
          id={titleId}
          title={block.title}
          subtitle={block.subtitle}
        />
      </div>
      {block.items.map(item => (
        <AppLink
          key={item.id}
          route={item.route}
          className={clsx(
            ROW_HOVER_CLASSNAME,
            "flex flex-wrap items-center gap-x-4 gap-y-2 px-3 py-3.5 md:grid md:grid-cols-[minmax(0,1fr)_150px_120px]",
            cardRowDividerClassName
          )}
        >
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="text-sm font-medium text-ink-100">
              {item.title}
            </span>
            <span className="text-[13px] text-ink-400">{item.detail}</span>
          </span>
          <span className="flex flex-col md:items-end">
            <span className="text-[15px] font-medium text-ink-100">
              {item.value}
            </span>
            <span className="text-xs text-ink-400">{item.valueLabel}</span>
          </span>
          <span className="whitespace-nowrap text-[13px] font-medium text-primary-700 hover:text-primary dark:text-primary-200 md:justify-self-end">
            {item.cta}
          </span>
        </AppLink>
      ))}
    </Card>
  );
}
