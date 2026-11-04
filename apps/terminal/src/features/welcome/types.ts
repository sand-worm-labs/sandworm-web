import type { RouteId } from "@/config/routes";

export type WelcomeLead =
  | { _tag: "count"; value: string; tone: "brand" | "navy" }
  | { _tag: "chat" };

export type WelcomeItem = {
  id: string;
  route: RouteId;
  title: string;
  detail: string;
  lead: WelcomeLead;
};

export type WelcomeContent = {
  firstBriefingCount: number;
  briefingHighlight: string;
  readyReports: number;
  trackingSummary: string;
};

export type WelcomeData = {
  items: readonly WelcomeItem[];
  trackingSummary: string;
};
