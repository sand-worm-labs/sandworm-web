import type { InviteTimingId } from "@sandworm/types/terminal";

export const INVITE_TIMINGS = [
  { id: "when_ready", label: "When numbers are ready" },
  { id: "now", label: "Now" },
  { id: "manual", label: "I'll send it myself" },
] as const satisfies readonly { id: InviteTimingId; label: string }[];
