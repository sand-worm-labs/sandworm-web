import clsx from "clsx";

import { AppLink } from "@/components/AppLink";
import { Card } from "@/components/Card";

import { BlockHeader } from "../components/BlockHeader";
import {
  LIST_ROW_DIVIDER_CLASSNAME,
  TEXT_LINK_CLASSNAME,
} from "../components/list-row";
import type { GapsBlock } from "../types";

export function GapsCard({ block }: { block: GapsBlock }) {
  const titleId = `${block.id}-title`;

  return (
    <Card aria-labelledby={titleId} className="px-4 pb-2.5 pt-[22px]">
      <div className="px-2 pb-2">
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
            "flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl px-2 py-3.5 transition-colors hover:bg-primary-tint-50 dark:hover:bg-dropdown-hover md:grid md:grid-cols-[minmax(0,1fr)_150px_120px]",
            LIST_ROW_DIVIDER_CLASSNAME
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
          <span className={clsx(TEXT_LINK_CLASSNAME, "md:justify-self-end")}>
            {item.cta}
          </span>
        </AppLink>
      ))}
    </Card>
  );
}
