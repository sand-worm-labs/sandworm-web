export const TEAM_CLIENTS_PATH = "/team";

export const TEAM_STEP_IDS = ["details", "tracking"] as const;

export type TeamStepId = (typeof TEAM_STEP_IDS)[number];

export function teamStepPath(id: TeamStepId): string {
  return `/team/clients/new/${id}`;
}

export function isTeamStepId(value: string): value is TeamStepId {
  return TEAM_STEP_IDS.some(id => id === value);
}
