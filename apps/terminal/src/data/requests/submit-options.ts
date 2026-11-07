import type {
  RequestTimingId,
  RequestUseCaseId,
} from "@sandworm/types/terminal";

export const USE_CASES = [
  { id: "plan-launch", label: "Plan a launch" },
  { id: "pick-partner", label: "Pick a partner" },
  { id: "investor-update", label: "Board or investor update" },
  { id: "other", label: "Something else" },
] as const satisfies readonly { id: RequestUseCaseId; label: string }[];

export type UseCaseId = (typeof USE_CASES)[number]["id"];

export const TIMINGS = [
  { id: "two-weeks", label: "In about 2 weeks" },
  { id: "one-week", label: "Within a week" },
  { id: "no-rush", label: "No rush" },
] as const satisfies readonly { id: RequestTimingId; label: string }[];

export type TimingId = (typeof TIMINGS)[number]["id"];
