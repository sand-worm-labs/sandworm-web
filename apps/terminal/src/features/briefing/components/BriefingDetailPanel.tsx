import { buttonClassName } from "@sandworm/ui/kit/button";
import { Card } from "@sandworm/ui/kit/card";

import { AppLink } from "@/components/AppLink";

import { BriefingKindTag } from "../BriefingKindTag";
import type { BriefingItem } from "../types";

import { BarBreakdown } from "./BarBreakdown";
import { HeadlineMetric } from "./HeadlineMetric";

type BriefingDetailPanelProps = {
  item: BriefingItem;
  clientName: string;
  analystName: string;
};

function DetailSection({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <h3 className="text-[13px] font-medium text-ink-100">{title}</h3>
      <p className="text-sm leading-[1.55] text-ink-500">{text}</p>
    </div>
  );
}

export function BriefingDetailPanel({
  item,
  clientName,
  analystName,
}: BriefingDetailPanelProps) {
  const { headline, breakdown, what, why } = item.detail;
  const titleId = `briefing-${item.id}-title`;

  return (
    <Card
      aria-labelledby={titleId}
      className="flex flex-col gap-5 px-7 pb-[22px] pt-7"
    >
      <div className="flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <BriefingKindTag kind={item.kind} />
          <span className="inline-flex h-[22px] items-center rounded-md bg-hover-bg px-2 text-xs text-ink-400">
            {item.entity}
          </span>
          <span className="text-xs text-ink-400">{item.when}</span>
        </div>
        <h2
          id={titleId}
          className="text-[22px] font-medium leading-tight text-ink-100"
        >
          {item.title}
        </h2>
      </div>
      {headline && <HeadlineMetric headline={headline} />}
      {breakdown && <BarBreakdown breakdown={breakdown} />}
      {what && <DetailSection title="What happened" text={what} />}
      {why && (
        <DetailSection title={`Why it matters for ${clientName}`} text={why} />
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-secondary pt-4">
        <div className="flex flex-wrap gap-2">
          <AppLink route={item.action.route} className={buttonClassName()}>
            {item.action.label}
          </AppLink>
          <AppLink
            route="bookCall"
            className={buttonClassName({ variant: "secondary" })}
          >
            Ask {analystName} about this
          </AppLink>
        </div>
        <span className="text-xs text-ink-400">Source: Sandworm</span>
      </div>
    </Card>
  );
}
