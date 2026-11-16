import {
  PiArchive,
  PiArrowLeft,
  PiArrowUUpLeft,
  PiEnvelopeSimple,
} from "react-icons/pi";
import { buttonClassName } from "@sandworm/ui/kit/button";
import { Card } from "@sandworm/ui/kit/card";
import type { BriefingItemData } from "@sandworm/types/terminal";

import { CellView } from "@/components/Cells/CellView";
import { ReportLink } from "@/components/ReportLink";
import { detailOf } from "@/lib/briefing/display";
import { fullWhen } from "@/lib/dates";
import { webAppUrl } from "@/lib/web-app";

import { BriefingActionButton } from "./BriefingActionButton";
import { BriefingKindTag } from "./BriefingKindTag";
import { HeadlineMetric } from "./HeadlineMetric";

type BriefingDetailPanelProps = {
  item: BriefingItemData;
  clientName: string;
  isArchived: boolean;
  // Back to the list, on a phone where the item has the screen to itself
  onBack: () => void;
  onMarkUnread: () => void;
  onArchive: () => void;
  onRestore: () => void;
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
  isArchived,
  onBack,
  onMarkUnread,
  onArchive,
  onRestore,
}: BriefingDetailPanelProps) {
  const { headline, outputs, what, why } = detailOf(item);
  const titleId = `briefing-${item.id}-title`;

  return (
    <Card
      bleed
      aria-labelledby={titleId}
      className="flex flex-col gap-5 px-4 pb-[22px] sm:px-7 lg:pt-7"
    >
      {/* Stays under the header while a long item scrolls, so Back is always there */}
      <div className="sticky top-14 z-20 -mx-4 flex items-center justify-between gap-2 border-b border-border-secondary bg-block-surface px-2 py-1 sm:-mx-7 sm:px-5 lg:static lg:mx-0 lg:justify-end lg:border-0 lg:px-0 lg:py-0">
        <div className="lg:hidden">
          <BriefingActionButton
            label="Briefing"
            icon={PiArrowLeft}
            onClick={onBack}
            isLabelled
          />
        </div>
        <div className="flex items-center gap-0.5">
          <BriefingActionButton
            label="Mark as unread"
            icon={PiEnvelopeSimple}
            onClick={onMarkUnread}
            isLabelled
          />
          {isArchived ? (
            <BriefingActionButton
              label="Restore"
              icon={PiArrowUUpLeft}
              onClick={onRestore}
              isLabelled
            />
          ) : (
            <BriefingActionButton
              label="Archive"
              icon={PiArchive}
              onClick={onArchive}
              isLabelled
            />
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <BriefingKindTag kind={item.kind} />
          <span className="inline-flex h-[22px] items-center rounded-md bg-hover-bg px-2 text-xs text-ink-400">
            {item.subject}
          </span>
          <span className="text-xs text-ink-400">
            {fullWhen(item.publishedAt)}
          </span>
        </div>
        <h2
          id={titleId}
          className="text-xl font-medium leading-tight text-ink-100 sm:text-[22px]"
        >
          {item.title}
        </h2>
      </div>
      {headline && <HeadlineMetric headline={headline} />}
      {outputs && outputs.length > 0 && (
        <CellView outputs={outputs} title={item.title} />
      )}
      {what && <DetailSection title="What happened" text={what} />}
      {why && (
        <DetailSection title={`Why it matters for ${clientName}`} text={why} />
      )}
      <div className="border-t border-border-secondary pt-4">
        <ReportLink
          url={item.sourcePath ? webAppUrl(item.sourcePath) : undefined}
          className={`${buttonClassName()} max-lg:w-full`}
        >
          Open the notebook
        </ReportLink>
      </div>
    </Card>
  );
}
