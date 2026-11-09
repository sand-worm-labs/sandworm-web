import {
  RequestKindId,
  RequestTimingId,
  RequestUseCaseId,
  type RequestInput,
} from "@sandworm/types/terminal";

import { site } from "@/config/site";
import { fullWhen } from "@/lib/dates";
import type { RequestDraft, TimelineStep } from "@/types";
import { TIMINGS, USE_CASES } from "@/data/requests/submit-options";

export function emptyDraft(): RequestDraft {
  return {
    question: "",
    useCase: RequestUseCaseId.PLAN_LAUNCH,
    about: [],
    timing: RequestTimingId.TWO_WEEKS,
    files: [],
  };
}

export function canSubmit(draft: RequestDraft): boolean {
  return draft.question.trim().length > 0;
}

export function describeDraft(draft: RequestDraft): string {
  const useCase = USE_CASES.find(option => option.id === draft.useCase);
  const timing = TIMINGS.find(option => option.id === draft.timing);

  return [
    useCase && `For: ${useCase.label}`,
    draft.about.length > 0 && `About: ${draft.about.join(", ")}`,
    timing?.label,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function submittedTimeline(submittedAt: string): TimelineStep[] {
  return [
    {
      id: "submitted",
      label: "Submitted",
      state: "done",
      detail: fullWhen(submittedAt),
    },
    {
      id: "scoping",
      label: "Scoping",
      state: "next",
      detail: `${site.name} replies with a scope for you to approve`,
    },
    {
      id: "in-progress",
      label: "In progress",
      state: "later",
      detail: "Starts when you approve. Counts toward your allowance then.",
    },
    {
      id: "delivered",
      label: "Delivered",
      state: "later",
      detail: "Appears in Analysis and your Briefing",
    },
  ];
}

// The submit form asks for research; questions are asked elsewhere.
export const requestInputOf = (draft: RequestDraft): RequestInput => ({
  kind: RequestKindId.RESEARCH,
  question: draft.question,
  useCase: draft.useCase,
  about: [...draft.about],
  timing: draft.timing,
  files: [...draft.files],
});
