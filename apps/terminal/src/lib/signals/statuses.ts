export const SIGNAL_STATUSES = [
  "New",
  "Looking into it",
  "Acting on it",
  "Not for us",
] as const;

export type SignalStatus = (typeof SIGNAL_STATUSES)[number];
