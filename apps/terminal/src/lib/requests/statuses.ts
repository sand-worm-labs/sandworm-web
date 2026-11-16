export const RESEARCH_STATUSES = [
  "Submitted",
  "Scoping",
  "In progress",
  "Delivered",
  "Declined",
] as const;

export type ResearchStatus = (typeof RESEARCH_STATUSES)[number];

export const QUESTION_STATUSES = ["Upcoming", "Answered", "Done"] as const;

export type QuestionStatus = (typeof QUESTION_STATUSES)[number];
