// The client terminal's setup: the ids the terminal's option lists use and the
// shape the API stores. Labels and templates live with the terminal's UI; the
// API only needs to know which ids are valid.

export const ORGANISATION_TYPE_IDS = ['exchange', 'nft', 'protocol', 'chain', 'vc', 'accelerator'] as const;
export type OrganisationTypeId = (typeof ORGANISATION_TYPE_IDS)[number];

export const GOAL_IDS = ['markets', 'retain', 'rivals', 'partners', 'board', 'product'] as const;
export type GoalId = (typeof GOAL_IDS)[number];
export const MAX_GOALS = 3;

export const ACCESS_LEVEL_IDS = ['view', 'request', 'admin'] as const;
export type AccessLevelId = (typeof ACCESS_LEVEL_IDS)[number];

export type TeamInvite = { id: string; email: string; access: AccessLevelId };

export type SetupTracking = {
  addresses: string;
  autoDiscover: boolean;
  competitors: string[];
  regions: string[];
  shareInternalData: boolean;
};

export type SetupDraft = {
  organisation: { type: OrganisationTypeId; name: string; website: string };
  tracking: SetupTracking;
  goals: { selected: GoalId[] };
  team: { invites: TeamInvite[] };
};

// Who is using the terminal, and for which client. `client` is null until the
// user first saves their setup.
export const FIRST_BRIEFING_DAYS = 2;

export type TerminalSession = {
  user: { name: string };
  client: { name: string; type: OrganisationTypeId; access: AccessLevelId } | null;
  // How long after setup the first briefing is expected
  firstBriefingDays: number;
};
