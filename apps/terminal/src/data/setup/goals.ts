import type { GoalId } from "@sandworm/types/terminal";

export { type GoalId, MAX_GOALS } from "@sandworm/types/terminal";

export const GOALS = [
  { id: "markets", label: "Find new markets" },
  { id: "retain", label: "Keep users from leaving" },
  { id: "rivals", label: "Benchmark competitors" },
  { id: "partners", label: "Find partners" },
  { id: "board", label: "Board and investor updates" },
  { id: "product", label: "Decide what to build next" },
] as const satisfies readonly { id: GoalId; label: string }[];
