// The client terminal's setup: the ids the terminal's option lists use and the
// shape the API stores. Labels and templates live with the terminal's UI; the
// API only needs to know which ids are valid.

export enum OrganisationTypeId {
  EXCHANGE = 'exchange',
  PROTOCOL = 'protocol',
  CHAIN = 'chain',
  VC = 'vc',
  ACCELERATOR = 'accelerator',
  OTHER = 'other',
}

export enum GoalId {
  MARKETS = 'markets',
  RETAIN = 'retain',
  RIVALS = 'rivals',
  PARTNERS = 'partners',
  BOARD = 'board',
  PRODUCT = 'product',
}
export const MAX_GOALS = 3;

export enum AccessLevelId {
  VIEW = 'view',
  REQUEST = 'request',
  ADMIN = 'admin',
}

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
  client: { name: string; type: OrganisationTypeId; access: AccessLevelId; icon: SubjectIcon | null } | null;
  // How long after setup the first briefing is expected
  firstBriefingDays: number;
  // True until the member has seen the welcome after their first login
  needsWelcome: boolean;
};

// ── The Sandworm team's side: setting a client up for them ──

export enum PlanId {
  STARTER = 'starter',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

// A client the team created waits for its admin's first login: setting_up while the
// team is still working, invite_sent once the admin has been asked, live after they log in.
export enum ClientStatusId {
  SETTING_UP = 'setting_up',
  INVITE_SENT = 'invite_sent',
  LIVE = 'live',
}

export enum InviteTimingId {
  WHEN_READY = 'when_ready',
  NOW = 'now',
  MANUAL = 'manual',
}

export enum InviteStatusId {
  PENDING = 'pending',
  SENT = 'sent',
  CLAIMED = 'claimed',
}

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

// A notebook that feeds a client's terminal: the briefing items, signals and
// analysis the client sees come from its cells.
export type TeamClientSource = {
  documentId: string;
  title: string;
  path: string; // the notebook's address in the web app
  cells: number; // distinct cells the client's briefing items read from
  items: number; // briefing items, signals and analysis subjects it feeds
  lastRanAt: string | null; // ISO date of the newest run a briefing item froze
  schedule: { isActive: boolean; nextRunAt: string | null; lastRunAt: string | null } | null;
};

// One client as the team's client page shows it.
export type TeamClientDetail = TeamClientSummary & {
  website: string;
  description: string;
  members: number;
  lastReadAt: string | null; // ISO date a member last opened the briefing
  openRequests: number;
  newSignals: number;
  researchAllowance: number;
  sources: TeamClientSource[];
};

// What running a source on a client's behalf did.
export type TeamSourceRun = {
  status: 'idle' | 'running';
  cells: number; // cells that were run
  failed: { title: string; message: string }[];
};

// A request a client submits: research (scoped, approved, then worked on by
// Sandworm's agents into a report) or a question (answered without a scope).
export enum RequestKindId {
  RESEARCH = 'research',
  QUESTION = 'question',
}

// A question goes submitted → in_progress → delivered and skips the scope steps.
export enum RequestStatusId {
  SUBMITTED = 'submitted',
  SCOPING = 'scoping',
  AWAITING_APPROVAL = 'awaiting_approval',
  IN_PROGRESS = 'in_progress',
  DELIVERED = 'delivered',
  DECLINED = 'declined',
  FAILED = 'failed',
}

// The statuses of a request that is still being worked on
export const OPEN_REQUEST_STATUSES: readonly RequestStatusId[] = [
  RequestStatusId.SUBMITTED,
  RequestStatusId.SCOPING,
  RequestStatusId.AWAITING_APPROVAL,
  RequestStatusId.IN_PROGRESS,
];

export enum RequestUseCaseId {
  PLAN_LAUNCH = 'plan-launch',
  PICK_PARTNER = 'pick-partner',
  INVESTOR_UPDATE = 'investor-update',
  OTHER = 'other',
}

export enum RequestTimingId {
  TWO_WEEKS = 'two-weeks',
  ONE_WEEK = 'one-week',
  NO_RUSH = 'no-rush',
}

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
// report shows under one when its tags carry that subject's id. Ids belong to
// one client, so a tag never means anything for another.
export enum AnalysisViewKind {
  PROJECT = 'project',
  REGION = 'region',
  SECTOR = 'sector',
}

// A report is new for this long after it is published: "New for you" on Analysis
export const NEW_REPORT_DAYS = 7;

export type AnalysisReport = {
  id: string; // the report's document id
  title: string;
  line: string;
  publishedAt: string; // ISO date
  isNew: boolean; // published in the last NEW_REPORT_DAYS days
  path: string; // where the report opens in the web app, from its root
};

// What stands for a project, region or sector beside its name. A new kind of icon
// is a new member here, not a migration. A logo is the company's, shared by every
// client that has it, and is kept as /api/showcase/logos/<slug>; a flag is an ISO
// country code; a symbol is a key into the terminal's own icons.
export type SubjectIcon =
  | { kind: 'logo'; slug: string }
  | { kind: 'flag'; code: string }
  | { kind: 'symbol'; key: string };

export type AnalysisSubject = {
  id: string;
  view: AnalysisViewKind;
  name: string;
  icon: SubjectIcon | null; // null: the initial of its name
  kind: string; // the short line under the name, e.g. "Payments · Africa"
  impact: string; // e.g. "2,140 of your users"
  impactSize: number; // what the impact column sorts by
  reports: AnalysisReport[]; // newest first
};

export type TerminalAnalysis = { subjects: AnalysisSubject[] };

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
export enum BriefingKindId {
  ANALYSIS = 'analysis',
  SIGNAL = 'signal',
  METRIC = 'metric',
}

export type BriefingItemData = {
  id: string;
  kind: BriefingKindId;
  title: string;
  summary: string;
  subject: string;
  detail: Record<string, unknown>;
  publishedAt: string; // ISO date
  isRead: boolean;
  isArchived: boolean; // put away by this member; an archived item is also read
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
export enum SignalStatusId {
  NEW = 'new',
  LOOKING = 'looking',
  ACTING = 'acting',
  DISMISSED = 'dismissed',
}

export enum EvidenceId {
  STRONG = 'strong',
  SOME = 'some',
  EARLY = 'early',
}

// Why a client set a signal aside, so Sandworm stops surfacing what does not fit
export enum SignalDismissReasonId {
  NOT_RELEVANT = 'not-relevant',
  ALREADY_KNOWN = 'already-known',
  LOOKS_WRONG = 'looks-wrong',
  BAD_TIMING = 'bad-timing',
}

// What stands behind a signal, written when it is published
export type SignalDetail = {
  facts: { label: string; value: string; source: string }[];
  // What would make the evidence stronger
  gap: string;
  entities: { name: string; role: string; stat: string; icon: SubjectIcon | null }[];
  nextSteps: string[];
};

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
  feedback: string; // the client's own words on how it applies to them
  dismissReason: SignalDismissReasonId | null;
  detail: SignalDetail | null;
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

// Key numbers: the KPI schemas and how a KPI is built from its readings
export * from "./terminal-kpi";
