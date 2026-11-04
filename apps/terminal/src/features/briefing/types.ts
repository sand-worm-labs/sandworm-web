import type { Output } from "@sandworm/types";
import type { Tone } from "@sandworm/ui/kit/tone";

import type { RouteId } from "@/config/routes";

export type BriefingKind = "Analysis" | "Signal" | "Metric";

export type BriefingDetail = {
  headline?: {
    value: string;
    label: string;
    delta?: { text: string; tone: Tone };
  };
  // A frozen copy of the source cell's outputs from the run the item was made
  // from: whatever the notebook drew (chart, table, card, markdown).
  outputs?: readonly Output[];
  what?: string;
  why?: string;
};

export type BriefingItem = {
  id: string;
  group: string;
  kind: BriefingKind;
  title: string;
  summary: string;
  entity: string;
  time: string;
  when: string;
  isUnread: boolean;
  detail: BriefingDetail;
  // `url` opens the source in the web app (a report's notebook) instead of a terminal route
  action: { label: string; route: RouteId; url?: string };
};

export type BriefingFeed = {
  subtitle: string;
  items: readonly BriefingItem[];
  upToDate: { subtitle: string; message: string; archivedCount: number };
};
