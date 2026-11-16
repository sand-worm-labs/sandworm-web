import { InviteTimingId } from "@sandworm/types/terminal";

export const INVITE_TIMINGS = [
  { id: InviteTimingId.WHEN_READY, label: "When numbers are ready" },
  { id: InviteTimingId.NOW, label: "Now" },
  { id: InviteTimingId.MANUAL, label: "I'll send it myself" },
] as const satisfies readonly { id: InviteTimingId; label: string }[];
