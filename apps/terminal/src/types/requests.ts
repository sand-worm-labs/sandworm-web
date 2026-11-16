import type { TerminalRequests } from "@sandworm/types/terminal";

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

export type Allowance = TerminalRequests["allowance"];
