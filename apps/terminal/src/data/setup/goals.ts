import { GoalId } from "@sandworm/types/terminal";

export { type GoalId, MAX_GOALS } from "@sandworm/types/terminal";

export const GOALS = [
  { id: GoalId.MARKETS, label: "Find new markets" },
  { id: GoalId.RETAIN, label: "Keep users from leaving" },
  { id: GoalId.RIVALS, label: "Benchmark competitors" },
  { id: GoalId.PARTNERS, label: "Find partners" },
  { id: GoalId.BOARD, label: "Board and investor updates" },
  { id: GoalId.PRODUCT, label: "Decide what to build next" },
] as const satisfies readonly { id: GoalId; label: string }[];
