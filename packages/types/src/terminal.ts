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

// Analysis: what Sandworm has researched for a client, grouped by what it is
// about. A project subject is a parent document and its reports are that
// document's children. Regions and sectors hold no documents of their own: a
// report shows under one when its tags carry `region:<slug>` or `sector:<slug>`.
export const ANALYSIS_VIEW_IDS = ['project', 'region', 'sector'] as const;
export type AnalysisViewKind = (typeof ANALYSIS_VIEW_IDS)[number];

export type AnalysisReport = {
  id: string; // the report's document id
  title: string;
  line: string;
  publishedAt: string; // ISO date
  isNew: boolean; // published since the member last opened the terminal
  path: string; // where the report opens in the web app, from its root
};

export type AnalysisSubject = {
  id: string;
  view: AnalysisViewKind;
  slug: string;
  name: string;
  kind: string; // the short line under the name, e.g. "Payments · Africa"
  impact: string; // e.g. "2,140 of your users"
  impactSize: number; // what the impact column sorts by
  reports: AnalysisReport[]; // newest first
};

export type TerminalAnalysis = { subjects: AnalysisSubject[] };

export function analysisTag(view: Exclude<AnalysisViewKind, 'project'>, slug: string): string {
  return `${view}:${slug}`;
}

// The web app address of a document: its public page once it has a slug
// (published or unlisted), else its page inside the workspace. With a block,
// the notebook opens scrolled to that cell (`?block=<id>`).
export function documentPath(
  doc: { id: string; workspaceId: string; slug: string | null },
  blockId?: string | null,
): string {
  const path = doc.slug ? `/notebooks/${doc.slug}` : `/workspace/${doc.workspaceId}/documents/${doc.id}`;
  return blockId ? `${path}?block=${encodeURIComponent(blockId)}` : path;
}

// Briefing: what changed for the client, newest first. `detail` holds the
// headline, frozen cell outputs and the what/why text.
export const BRIEFING_KIND_IDS = ['analysis', 'signal', 'metric'] as const;
export type BriefingKindId = (typeof BRIEFING_KIND_IDS)[number];

export type BriefingItemData = {
  id: string;
  kind: BriefingKindId;
  title: string;
  summary: string;
  subject: string;
  detail: Record<string, unknown>;
  publishedAt: string; // ISO date
  isRead: boolean;
  sourcePath: string | null; // the cell it came from, in its notebook
};

export type TerminalBriefing = {
  lastSeenAt: string | null; // when the member last opened Briefing
  items: BriefingItemData[]; // the last BRIEFING_WINDOW_DAYS
  archivedCount: number; // older items
};

export const BRIEFING_WINDOW_DAYS = 14;

// Signals: what Sandworm saw in the client's data and what it could mean.
// The client triages them; Sandworm never calls one an opportunity.
export const SIGNAL_STATUS_IDS = ['new', 'looking', 'acting', 'dismissed'] as const;
export type SignalStatusId = (typeof SIGNAL_STATUS_IDS)[number];

export const EVIDENCE_IDS = ['strong', 'some', 'early'] as const;
export type EvidenceId = (typeof EVIDENCE_IDS)[number];

export type SignalData = {
  id: string;
  status: SignalStatusId;
  title: string;
  observed: string;
  couldMean: string;
  kind: string;
  size: string;
  sizeLabel: string;
  evidence: EvidenceId;
  subject: string;
  publishedAt: string; // ISO date
  reportPath: string | null;
};

export type TerminalSignals = { items: SignalData[] };

// Requests as the client sees them. Dates are ISO; the terminal draws the timeline from them.
export type RequestData = {
  id: string;
  kind: RequestKindId;
  question: string;
  status: RequestStatusId;
  useCase: RequestUseCaseId | null;
  about: string[];
  timing: RequestTimingId | null;
  requestedBy: string | null; // the member's name
  scope: RequestScope | null;
  progressNote: string | null;
  outcome: string | null;
  reportPath: string | null;
  submittedAt: string;
  scopedAt: string | null;
  approvedAt: string | null;
  closedAt: string | null;
};

export type TerminalRequests = {
  allowance: { used: number; total: number; resetsAt: string }; // research per calendar year
  requests: RequestData[]; // newest first
};

export type RequestInput = {
  kind: RequestKindId;
  question: string;
  useCase: RequestUseCaseId | null;
  about: string[];
  timing: RequestTimingId | null;
  files: string[];
};

// The numbers on the section tabs
export type TerminalCounts = { briefing: number; analysis: number; signals: number; requests: number };
