import type { QuestionStatus, ResearchStatus } from "@/lib/requests/statuses";

export type { QuestionStatus, ResearchStatus };

export type RequestStatus = ResearchStatus | QuestionStatus;

export type StepState = "done" | "next" | "later" | "declined";

export type TimelineStep = {
  id: string;
  label: string;
  state: StepState;
  when?: string;
  detail?: string;
};

type ScopeApproval = { scopedOn: string; due: string };

export type ResearchRequest = {
  id: string;
  title: string;
  by: string;
  status: ResearchStatus;
  next: string;
  steps: readonly TimelineStep[];
  note: { when: string; text: string };
  scopeApproval?: ScopeApproval;
  reportLabel?: string;
  // The report in the web app; fixtures have none
  reportUrl?: string;
};

export type QuestionEntry = {
  id: string;
  title: string;
  detail: string;
  status: QuestionStatus;
  when: string;
};

export type AllowanceMeter = { used: number; total: number };

export type Allowance = {
  research: AllowanceMeter;
  resetsOn: string;
  resetsShort: string;
  resetsMonth: string;
};

export type RequestsData = {
  allowance: Allowance;
  research: readonly ResearchRequest[];
  questions: readonly QuestionEntry[];
};
