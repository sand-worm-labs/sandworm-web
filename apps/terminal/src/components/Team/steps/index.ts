import type { TeamStepId } from "@/lib/team/routes";

import { detailsStep } from "./details";
import { trackingStep } from "./tracking";
import type { TeamStepDefinition } from "./types";

export const TEAM_STEPS: readonly TeamStepDefinition[] = [
  detailsStep,
  trackingStep,
];

export function getTeamStep(id: TeamStepId): TeamStepDefinition {
  const step = TEAM_STEPS.find(candidate => candidate.id === id);
  if (!step) throw new Error(`No team step registered for "${id}"`);
  return step;
}

export function getTeamStepNeighbours(id: TeamStepId) {
  const index = TEAM_STEPS.findIndex(step => step.id === id);
  return {
    previous: TEAM_STEPS[index - 1],
    next: TEAM_STEPS[index + 1],
  };
}
