import type { Tone } from "@/components/tone";
import type { RouteId } from "@/config/routes";

export type BriefingKind = "Analysis" | "Opportunity" | "Metric";

export type BriefingBar = {
  id: string;
  label: string;
  share: number;
  value: string;
  isHighlighted?: boolean;
};

export type BriefingDetail = {
  headline?: {
    value: string;
    label: string;
    delta?: { text: string; tone: Tone };
  };
  breakdown?: { title: string; bars: readonly BriefingBar[] };
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
  action: { label: string; route: RouteId };
};

export type BriefingFeed = {
  subtitle: string;
  items: readonly BriefingItem[];
  upToDate: { subtitle: string; message: string; archivedCount: number };
};
