import type { Signal } from "@/types";

import { SIGNAL_STATUSES, type SignalStatus } from "./statuses";

export const OPEN_STATUSES = [
  "New",
  "Looking into it",
  "Acting on it",
] as const satisfies readonly SignalStatus[];

export type SignalFilter = "open" | SignalStatus;

export function filterSignals(
  items: readonly Signal[],
  filter: SignalFilter
): readonly Signal[] {
  if (filter === "open") {
    return items.filter(item => isOpen(item.status));
  }
  return items.filter(item => item.status === filter);
}

export function groupByStatus(items: readonly Signal[]) {
  return SIGNAL_STATUSES.map(status => ({
    status,
    items: items.filter(item => item.status === status),
  })).filter(group => group.items.length > 0);
}

function isOpen(status: SignalStatus) {
  return OPEN_STATUSES.some(open => open === status);
}
