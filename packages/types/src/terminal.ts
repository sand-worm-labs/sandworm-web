// The client terminal's setup: the ids the terminal's option lists use and the
// shape the API stores. Labels and templates live with the terminal's UI; the
// API only needs to know which ids are valid.

export const ORGANISATION_TYPE_IDS = ['exchange', 'protocol', 'chain', 'vc', 'accelerator', 'other'] as const;
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
  organisation: { type: OrganisationTypeId; name: string; website: string; description: string };
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
  // True until the member has seen the welcome after their first login
  needsWelcome: boolean;
};

// ── The Sandworm team's side: setting a client up for them ──

export const PLAN_IDS = ['starter', 'pro', 'enterprise'] as const;
export type PlanId = (typeof PLAN_IDS)[number];

// A client the team created waits for its admin's first login: setting_up while the
// team is still working, invite_sent once the admin has been asked, live after they log in.
export const CLIENT_STATUS_IDS = ['setting_up', 'invite_sent', 'live'] as const;
export type ClientStatusId = (typeof CLIENT_STATUS_IDS)[number];

export const INVITE_TIMING_IDS = ['when_ready', 'now', 'manual'] as const;
export type InviteTimingId = (typeof INVITE_TIMING_IDS)[number];

export const INVITE_STATUS_IDS = ['pending', 'sent', 'claimed'] as const;
export type InviteStatusId = (typeof INVITE_STATUS_IDS)[number];

export type TeamClientDraft = {
  details: {
    name: string;
    website: string;
    type: OrganisationTypeId;
    description: string;
    plan: PlanId;
    adminName: string;
    adminEmail: string;
  };
  tracking: SetupTracking;
  // Ids of the existing research the client starts with
  starterIds: string[];
  inviteTiming: InviteTimingId;
};

export type TeamClientSummary = {
  id: string;
  name: string;
  type: OrganisationTypeId;
  plan: PlanId;
  status: ClientStatusId;
  adminEmail: string | null;
  createdAt: string; // ISO date
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
