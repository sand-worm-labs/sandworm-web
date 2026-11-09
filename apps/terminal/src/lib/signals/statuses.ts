import type { SignalStatusId } from "@sandworm/types/terminal";

export const SIGNAL_STATUSES = [
  "New",
  "Looking into it",
  "Acting on it",
  "Not for us",
] as const;

export type SignalStatus = (typeof SIGNAL_STATUSES)[number];

export const SIGNAL_STATUS_LABEL: Record<SignalStatusId, SignalStatus> = {
  new: "New",
  looking: "Looking into it",
  acting: "Acting on it",
  dismissed: "Not for us",
};

export const SIGNAL_STATUS_ID = Object.fromEntries(
  Object.entries(SIGNAL_STATUS_LABEL).map(([id, label]) => [label, id])
) as Record<SignalStatus, SignalStatusId>;
