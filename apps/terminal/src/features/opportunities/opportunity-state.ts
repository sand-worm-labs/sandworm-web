import {
  OPPORTUNITY_STATUSES,
  type Opportunity,
  type OpportunityStatus,
} from "./types";

export const OPEN_STATUSES = [
  "New",
  "Reviewing",
  "Pursuing",
] as const satisfies readonly OpportunityStatus[];

export type OpportunityFilter = "open" | OpportunityStatus;

export function filterOpportunities(
  items: readonly Opportunity[],
  filter: OpportunityFilter
): readonly Opportunity[] {
  if (filter === "open") {
    return items.filter(item => isOpen(item.status));
  }
  return items.filter(item => item.status === filter);
}

export function groupByStatus(items: readonly Opportunity[]) {
  return OPPORTUNITY_STATUSES.map(status => ({
    status,
    items: items.filter(item => item.status === status),
  })).filter(group => group.items.length > 0);
}

function isOpen(status: OpportunityStatus) {
  return OPEN_STATUSES.some(open => open === status);
}
