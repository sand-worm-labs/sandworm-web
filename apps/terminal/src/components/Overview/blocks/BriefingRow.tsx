import clsx from "clsx";
import { ROW_HOVER_CLASSNAME } from "@sandworm/ui/kit/interactive";

import { AppLink } from "@/components/AppLink";
import { BriefingKindTag } from "@/components/Briefing/BriefingKindTag";
import type { BriefingEntry } from "@/features/overview/types";

export function BriefingRow({ entry }: { entry: BriefingEntry }) {
  return (
    <AppLink
      route="briefing"
      query={{ item: entry.id }}
      className={clsx(
        ROW_HOVER_CLASSNAME,
        "flex flex-col gap-2 px-3 py-3 md:grid md:grid-cols-[8px_104px_minmax(0,1fr)_auto] md:items-start md:gap-x-3"
      )}
    >
      <span
        aria-label={entry.isUnread ? "Unread" : "Read"}
        className={clsx(
          "mt-[7px] hidden size-2 rounded-full md:block",
          entry.isUnread ? "bg-primary" : "bg-transparent"
        )}
      />
      <BriefingKindTag kind={entry.kind} />
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-sm font-medium text-ink-100">{entry.title}</span>
        <span className="text-[13px] text-ink-400">{entry.summary}</span>
      </span>
      <span className="flex items-center gap-2 md:flex-col md:items-end md:gap-1">
        <span className="inline-flex h-[22px] items-center whitespace-nowrap rounded-md bg-hover-bg px-2 text-xs text-ink-400">
          {entry.entity}
        </span>
        <span className="whitespace-nowrap text-xs text-ink-400">
          {entry.time}
        </span>
      </span>
    </AppLink>
  );
}
