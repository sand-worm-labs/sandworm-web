export const SETUP_STEP_IDS = ["organisation", "tracking", "goals"] as const;

export type SetupStepId = (typeof SETUP_STEP_IDS)[number];

export const SETUP_COMPLETE_PATH = "/";

export function setupStepPath(id: SetupStepId): string {
  return `/setup/${id}`;
}

export function isSetupStepId(value: string): value is SetupStepId {
  return SETUP_STEP_IDS.some(id => id === value);
}
