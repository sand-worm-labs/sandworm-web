import type { PlanId } from "@sandworm/types/terminal";

type PlanDefinition = {
  id: PlanId;
  label: string;
  description: string;
  research: string;
  calls: string;
};

export const PLANS = [
  {
    id: "starter",
    label: "Starter",
    description: "2 studies and 1 call a quarter",
    research: "2 a quarter",
    calls: "1 a quarter",
  },
  {
    id: "pro",
    label: "Pro",
    description: "5 studies and 4 calls a quarter",
    research: "5 a quarter",
    calls: "4 a quarter",
  },
  {
    id: "enterprise",
    label: "Enterprise",
    description: "Custom work and a dedicated analyst",
    research: "Custom",
    calls: "As needed",
  },
] as const satisfies readonly PlanDefinition[];

export function getPlan(id: PlanId) {
  return PLANS.find(plan => plan.id === id) ?? PLANS[0];
}
