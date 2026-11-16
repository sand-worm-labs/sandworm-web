import { isEnumValue } from "../enum";

export const TEAM_CLIENTS_PATH = "/team";

export enum TeamStepId {
  DETAILS = "details",
  TRACKING = "tracking",
}

export const TEAM_STEP_IDS = Object.values(TeamStepId);

export function teamStepPath(id: TeamStepId): string {
  return `/team/clients/new/${id}`;
}

export const isTeamStepId = isEnumValue(TeamStepId);
