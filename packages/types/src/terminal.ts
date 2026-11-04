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

// A request a client submits: research (scoped, approved, then worked on by
// Sandworm's agents into a report) or a question (answered without a scope).
export const REQUEST_KIND_IDS = ['research', 'question'] as const;
export type RequestKindId = (typeof REQUEST_KIND_IDS)[number];

// A question goes submitted → in_progress → delivered and skips the scope steps.
export const REQUEST_STATUS_IDS = [
  'submitted',
  'scoping',
  'awaiting_approval',
  'in_progress',
  'delivered',
  'declined',
  'failed',
] as const;
export type RequestStatusId = (typeof REQUEST_STATUS_IDS)[number];

export const REQUEST_USE_CASE_IDS = ['plan-launch', 'pick-partner', 'investor-update', 'other'] as const;
export type RequestUseCaseId = (typeof REQUEST_USE_CASE_IDS)[number];

export const REQUEST_TIMING_IDS = ['two-weeks', 'one-week', 'no-rush'] as const;
export type RequestTimingId = (typeof REQUEST_TIMING_IDS)[number];

// What the agent proposes after reading the request, for the client to approve.
export type RequestScope = {
  summary: string;
  questions: string[];
  sources: string[];
  dueAt: string; // ISO date
};
