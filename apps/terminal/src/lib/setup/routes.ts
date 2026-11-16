import { isEnumValue } from "../enum";

export enum SetupStepId {
  ORGANISATION = "organisation",
  TRACKING = "tracking",
  GOALS = "goals",
}

export const SETUP_STEP_IDS = Object.values(SetupStepId);

export const SETUP_COMPLETE_PATH = "/";

export function setupStepPath(id: SetupStepId): string {
  return `/setup/${id}`;
}

export const isSetupStepId = isEnumValue(SetupStepId);
