export const SIGNAL_STATUSES = [
  "New",
  "Reviewing",
  "Pursuing",
  "Passed",
] as const;

export type SignalStatus = (typeof SIGNAL_STATUSES)[number];
