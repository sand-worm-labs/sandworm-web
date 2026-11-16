import { RequestTimingId, RequestUseCaseId } from "@sandworm/types/terminal";

export const USE_CASES = [
  { id: RequestUseCaseId.PLAN_LAUNCH, label: "Plan a launch" },
  { id: RequestUseCaseId.PICK_PARTNER, label: "Pick a partner" },
  { id: RequestUseCaseId.INVESTOR_UPDATE, label: "Board or investor update" },
  { id: RequestUseCaseId.OTHER, label: "Something else" },
] as const satisfies readonly { id: RequestUseCaseId; label: string }[];

export const TIMINGS = [
  { id: RequestTimingId.TWO_WEEKS, label: "In about 2 weeks" },
  { id: RequestTimingId.ONE_WEEK, label: "Within a week" },
  { id: RequestTimingId.NO_RUSH, label: "No rush" },
] as const satisfies readonly { id: RequestTimingId; label: string }[];
