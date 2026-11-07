import clsx from "clsx";
import { buttonClassName } from "@sandworm/ui/kit/button";
import { Card, cardRowDividerClassName } from "@sandworm/ui/kit/card";
import { ROW_HOVER_CLASSNAME } from "@sandworm/ui/kit/interactive";

import { AppLink } from "@/components/AppLink";
import { ConfidenceMeter } from "@/components/Signals/ConfidenceMeter";
import { SignalStatusIcon } from "@/components/Signals/SignalStatusIcon";
import { BlockHeader } from "@/components/Overview/BlockHeader";
import type { SignalsBlock } from "@/types";

export function SignalsCard({ block }: { block: SignalsBlock }) {
  const titleId = `${block.id}-title`;

  return (
    <Card aria-labelledby={titleId} className="px-3 pb-2.5 pt-[22px]">
      <div className="px-3 pb-2">
        <BlockHeader
          id={titleId}
          title={block.title}
          subtitle={block.subtitle}
          action={
            <AppLink
              route="signals"
              className={buttonClassName({
                variant: "link",
                className: "whitespace-nowrap font-medium",
              })}
            >
              All signals
            </AppLink>
          }
        />
      </div>
      {block.items.map(item => (
        <AppLink
          key={item.id}
          route="signal"
          className={clsx(
            ROW_HOVER_CLASSNAME,
            "flex flex-wrap items-start gap-x-4 gap-y-2 px-3 py-3.5 md:grid md:grid-cols-[14px_minmax(0,1fr)_140px_130px_84px]",
            cardRowDividerClassName
          )}
        >
          <SignalStatusIcon status={item.status} />
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
