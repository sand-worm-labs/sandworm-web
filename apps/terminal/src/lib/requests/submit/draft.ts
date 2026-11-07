import { site } from "@/config/site";
import type { RequestDraft, TimelineStep } from "@/types";
import { TIMINGS, USE_CASES } from "@/data/requests/submit-options";

export function emptyDraft(): RequestDraft {
  return {
    question: "",
    useCase: "plan-launch",
    about: [],
    timing: "two-weeks",
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

export function formatSubmittedAt(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");

  return `Today, ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function submittedTimeline(submittedAt: string): TimelineStep[] {
  return [
    { id: "submitted", label: "Submitted", state: "done", detail: submittedAt },
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
