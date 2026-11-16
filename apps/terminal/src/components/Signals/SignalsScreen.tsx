"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SignalDismissReasonId } from "@sandworm/types/terminal";
import { BarLoader } from "@sandworm/ui/kit/bar-loader";
import { Card } from "@sandworm/ui/kit/card";
import { SegmentedControl } from "@sandworm/ui/kit/segmented-control";

import { site } from "@/config/site";
import { SectionHeader } from "@/components/Sections/SectionHeader";
import {
  useSetTerminalSignalFeedbackMutation,
  useSetTerminalSignalStatusMutation,
} from "@/generated/graphql";
import { useSignals } from "@/hooks/useSignals";
import { SIGNAL_STATUS_ID } from "@/lib/signals/statuses";
import { usePreview } from "@/providers/PreviewProvider";
import type { SectionCounts, SignalStatus, SignalsFeed } from "@/types";
import { SignalsEmpty } from "@/components/Signals/SignalsEmpty";
import { SignalDetailDialog } from "@/components/Signals/SignalDetailDialog";
import { SignalRow } from "@/components/Signals/SignalRow";
import { SignalStatusIcon } from "@/components/Signals/SignalStatusIcon";
import {
  filterSignals,
  groupByStatus,
  type SignalFilter,
} from "@/lib/signals/signal-state";

const FILTERS: readonly { id: SignalFilter; label: string }[] = [
  { id: "open", label: "All open" },
  { id: "New", label: "New" },
  { id: "Looking into it", label: "Looking into it" },
  { id: "Acting on it", label: "Acting on it" },
  { id: "Not for us", label: "Not for us" },
];

type SignalsScreenProps = {
  counts: SectionCounts;
  viewer: { clientName: string };
};

export function SignalsScreen(props: SignalsScreenProps) {
  const { data: feed, error } = useSignals();
  if (error) {
    return (
      <p className="text-sm text-ink-400">
        Could not load the signals. Please try again.
      </p>
    );
  }
  return feed ? (
    <SignalsList feed={feed} {...props} />
  ) : (
    <div className="flex min-h-[60vh] items-center justify-center">
      <BarLoader />
    </div>
  );
}

function SignalsList({
  feed,
  counts,
  viewer,
}: SignalsScreenProps & { feed: SignalsFeed }) {
  const [filter, setFilter] = useState<SignalFilter>("open");
  const { isForced } = usePreview();
  const router = useRouter();
  // The tab counts come from the server, so they are fetched again once saved
  const [setStatus] = useSetTerminalSignalStatusMutation({
    onCompleted: () => router.refresh(),
  });
  // The client's own status choices, on top of what the feed says
  const [chosen, setChosen] = useState<
    Record<string, { status: SignalStatus; reason?: SignalDismissReasonId }>
  >({});
  const [setFeedback] = useSetTerminalSignalFeedbackMutation();
  const [written, setWritten] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState<string>();

  const items = feed.items.map(item => ({
    ...item,
    status: chosen[item.id]?.status ?? item.status,
    dismissReason: chosen[item.id]
      ? chosen[item.id]?.reason
      : item.dismissReason,
    feedback: written[item.id] ?? item.feedback,
  }));
  const selected = items.find(item => item.id === selectedId);

  const changeStatus = (
    id: string,
    status: SignalStatus,
    reason?: SignalDismissReasonId
  ) => {
    setChosen(current => ({ ...current, [id]: { status, reason } }));
    // A preview visitor has no session, so their choice stays in the page only
    if (!isForced) {
      setStatus({
        variables: { signalId: id, status: SIGNAL_STATUS_ID[status], reason },
        onError: () => setChosen(({ [id]: _unsaved, ...saved }) => saved),
      });
    }
  };

  const saveFeedback = (id: string, feedback: string) => {
    setWritten(current => ({ ...current, [id]: feedback }));
    if (!isForced) {
      setFeedback({
        variables: { signalId: id, feedback },
        onError: () => setWritten(({ [id]: _unsaved, ...saved }) => saved),
      });
    }
  };

  const filterOptions = FILTERS.map(option => ({
    ...option,
    count: filterSignals(items, option.id).length,
  }));
  const groups = groupByStatus(filterSignals(items, filter));

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        current="signals"
        title="Signals"
        subtitle={`What ${site.name} saw in ${viewer.clientName}'s data, and what it could mean.`}
        counts={counts}
      />
      {feed.items.length === 0 ? (
        <SignalsEmpty />
      ) : (
        <Card bleed aria-label="Signals" className="flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-secondary px-5 py-4">
            <SegmentedControl
              label="Filter by status"
              options={filterOptions}
              value={filter}
              onChange={setFilter}
            />
          </div>
          <div className="px-2 pb-2.5 pt-1">
            {groups.length === 0 && (
              <p className="px-3 py-10 text-center text-sm text-ink-400">
                Nothing here yet.
              </p>
            )}
            {groups.map(group => (
              <section
                key={group.status}
                aria-label={group.status}
                className="flex flex-col"
              >
                <h2 className="flex items-center gap-2 px-3 pb-1.5 pt-3.5 text-xs font-medium text-ink-500">
                  <SignalStatusIcon status={group.status} />
                  {group.status}
                  <span className="font-normal text-ink-400">
                    {group.items.length}
                  </span>
                </h2>
                {group.items.map((item, index) => (
                  <div
                    key={item.id}
                    className={
                      index > 0 ? "border-t border-border-secondary" : undefined
                    }
                  >
                    <SignalRow
                      item={item}
                      onSelect={signal => setSelectedId(signal.id)}
                    />
                  </div>
                ))}
              </section>
            ))}
          </div>
        </Card>
      )}
      {selected && (
        <SignalDetailDialog
          signal={selected}
          onStatusChange={(status, reason) =>
            changeStatus(selected.id, status, reason)
          }
          onFeedbackSave={feedback => saveFeedback(selected.id, feedback)}
          onClose={() => setSelectedId(undefined)}
        />
      )}
    </div>
  );
}
