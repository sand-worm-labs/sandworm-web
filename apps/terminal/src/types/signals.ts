import type { SignalStatus } from "@/lib/signals/statuses";

export type { SignalStatus };

export type Confidence = "High" | "Medium" | "Low";

export type Signal = {
  id: string;
  status: SignalStatus;
  title: string;
  summary: string;
  kind: string;
  value: string;
  valueLabel: string;
  confidence: Confidence;
  when: string;
};

export type SignalsFeed = {
  items: readonly Signal[];
};
