import type { SetupStepId } from "@/lib/setup/routes";

import { goalsStep } from "./goals";
import { organisationStep } from "./organisation";
import { trackingStep } from "./tracking";
import type { SetupStepDefinition } from "./types";

export const SETUP_STEPS: readonly SetupStepDefinition[] = [
  organisationStep,
  trackingStep,
  goalsStep,
];

export function getSetupStep(id: SetupStepId): SetupStepDefinition {
  const step = SETUP_STEPS.find(candidate => candidate.id === id);
  if (!step) throw new Error(`No setup step registered for "${id}"`);
  return step;
}

export function getStepNeighbours(id: SetupStepId) {
  const index = SETUP_STEPS.findIndex(step => step.id === id);
  return {
    index,
    previous: SETUP_STEPS[index - 1],
    next: SETUP_STEPS[index + 1],
  };
}
