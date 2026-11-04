export const OPPORTUNITY_STATUSES = [
  "New",
  "Reviewing",
  "Pursuing",
  "Passed",
] as const;

export type OpportunityStatus = (typeof OPPORTUNITY_STATUSES)[number];

export type Confidence = "High" | "Medium" | "Low";

export type Opportunity = {
  id: string;
  status: OpportunityStatus;
  title: string;
  summary: string;
  kind: string;
  value: string;
  valueLabel: string;
  confidence: Confidence;
  when: string;
};

export type OpportunitiesFeed = {
  items: readonly Opportunity[];
};
