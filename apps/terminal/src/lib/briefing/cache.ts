import type { ApolloCache } from "@apollo/client";

import {
  TerminalBriefingDocument,
  type TerminalBriefingQuery,
} from "@/generated/graphql";

import type { BriefingState } from "./inbox-state";

type BriefingData = TerminalBriefingQuery["terminalBriefing"];

function updateBriefing(
  cache: ApolloCache<unknown>,
  change: (briefing: BriefingData) => BriefingData
) {
  cache.updateQuery<TerminalBriefingQuery>(
    { query: TerminalBriefingDocument },
    data => data && { ...data, terminalBriefing: change(data.terminalBriefing) }
  );
}

// Keeps the cached briefing in step with what the member did, so coming back to
// the page shows it without asking the API again
export const patchBriefingItems = (
  cache: ApolloCache<unknown>,
  itemIds: readonly string[],
  patch: Partial<BriefingState>
) =>
  updateBriefing(cache, briefing => ({
    ...briefing,
    items: briefing.items.map(item =>
      itemIds.includes(item.id) ? { ...item, ...patch } : item
    ),
  }));

// The next visit starts from now
export const stampBriefingSeen = (cache: ApolloCache<unknown>, at: Date) =>
  updateBriefing(cache, briefing => ({
    ...briefing,
    lastSeenAt: at.toISOString(),
  }));
