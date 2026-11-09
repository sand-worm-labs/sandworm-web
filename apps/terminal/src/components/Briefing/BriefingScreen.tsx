"use client";

import clsx from "clsx";
import { PiChecks } from "react-icons/pi";
import type { TerminalBriefing } from "@sandworm/types/terminal";
import { BarLoader } from "@sandworm/ui/kit/bar-loader";
import { Button } from "@sandworm/ui/kit/button";

import { SectionHeader } from "@/components/Sections/SectionHeader";
import { sinceLabel, upToDateMessage } from "@/lib/briefing/display";
import { stateOf } from "@/lib/briefing/inbox-state";
import type { SectionCounts } from "@/types";
import { useBriefing } from "@/hooks/useBriefing";
import { useBriefingInbox } from "@/hooks/useBriefingInbox";

import { BriefingDetailPanel } from "./BriefingDetailPanel";
import { BriefingList } from "./BriefingList";
import { BriefingUpToDate } from "./BriefingUpToDate";

type BriefingScreenProps = {
  counts: SectionCounts;
  viewer: { clientName: string };
  // The item to open on, from ?item=
  initialItemId?: string;
};

// The list and the item stay in view side by side, each scrolling on its own
const STICKY_COLUMN =
  "lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto";

export function BriefingScreen(props: BriefingScreenProps) {
  const { data: feed, error } = useBriefing();
  if (error) {
    return (
      <p className="text-sm text-ink-400">
        Could not load the briefing. Please try again.
      </p>
    );
  }
  return feed ? (
    <BriefingInbox feed={feed} {...props} />
  ) : (
    <div className="flex min-h-[60vh] items-center justify-center">
      <BarLoader />
    </div>
  );
}

function BriefingInbox({
  feed,
  counts,
  viewer,
  initialItemId,
}: BriefingScreenProps & { feed: TerminalBriefing }) {
  const inbox = useBriefingInbox(feed, initialItemId);
  const { selected } = inbox;
  const hasItems = feed.items.length > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* On a phone an opened item has the whole screen */}
      <div className={clsx(inbox.isDetailOpen && "max-lg:hidden")}>
        <SectionHeader
          current="briefing"
          title="Briefing"
          subtitle={sinceLabel(inbox.lastSeenAt)}
          counts={counts}
          actions={
            hasItems && (
              <Button
                variant="secondary"
                className="gap-2"
                disabled={inbox.unreadCount === 0}
                onClick={inbox.markAllRead}
              >
                <PiChecks size={16} className="text-ink-navy" />
                Mark all as read
              </Button>
            )
          }
        />
      </div>
      {hasItems ? (
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
          <div
            className={clsx(
              "lg:sticky lg:top-6",
              inbox.isDetailOpen && "max-lg:hidden"
            )}
          >
            <BriefingList
              groups={inbox.groups}
              filter={inbox.filter}
              counts={inbox.counts}
              unreadCount={inbox.unreadCount}
              selectedId={selected?.id}
              isUnread={item => !stateOf(item, inbox.overrides).isRead}
              onFilter={inbox.setFilter}
              onSelect={inbox.select}
              onToggleRead={inbox.toggleRead}
              onArchive={inbox.archiveItem}
              onRestore={inbox.restoreItem}
              undo={inbox.undo}
            />
          </div>
          {selected && (
            <div
              className={clsx(
                STICKY_COLUMN,
                !inbox.isDetailOpen && "max-lg:hidden"
              )}
            >
              <BriefingDetailPanel
                item={selected}
                clientName={viewer.clientName}
                isArchived={stateOf(selected, inbox.overrides).isArchived}
                onBack={inbox.closeDetail}
                onMarkUnread={() => inbox.toggleRead(selected.id)}
                onArchive={() => inbox.archiveItem(selected.id)}
                onRestore={() => inbox.restoreItem(selected.id)}
              />
            </div>
          )}
        </div>
      ) : (
        <BriefingUpToDate
          message={upToDateMessage(inbox.lastSeenAt)}
          archivedCount={feed.archivedCount}
        />
      )}
    </div>
  );
}
