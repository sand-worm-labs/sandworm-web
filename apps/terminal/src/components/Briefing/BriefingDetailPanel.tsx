import { buttonClassName } from "@sandworm/ui/kit/button";
import { Card } from "@sandworm/ui/kit/card";

import { AppLink } from "@/components/AppLink";
import type { BriefingItem } from "@/types";

import { BriefingKindTag } from "./BriefingKindTag";
import { CellOutputs } from "./CellOutputs";
import { HeadlineMetric } from "./HeadlineMetric";

type BriefingDetailPanelProps = {
  item: BriefingItem;
  clientName: string;
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
}: BriefingDetailPanelProps) {
  const { headline, outputs, what, why } = item.detail;
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
      {outputs && outputs.length > 0 && (
        <CellOutputs outputs={outputs} title={item.title} />
      )}
      {what && <DetailSection title="What happened" text={what} />}
      {why && (
        <DetailSection title={`Why it matters for ${clientName}`} text={why} />
      )}
      <div className="border-t border-border-secondary pt-4">
        {item.action.url ? (
          <a
            href={item.action.url}
            target="_blank"
            rel="noreferrer"
            className={buttonClassName()}
          >
            {item.action.label}
          </a>
        ) : (
          <AppLink route={item.action.route} className={buttonClassName()}>
            {item.action.label}
          </AppLink>
        )}
      </div>
    </Card>
  );
}
