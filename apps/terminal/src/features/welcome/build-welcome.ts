import type { Session } from "@/features/session/types";
import { site } from "@/config/site";

import type { WelcomeContent, WelcomeData } from "./types";

export function buildWelcome(
  content: WelcomeContent,
  { client }: Session
): WelcomeData {
  return {
    trackingSummary: content.trackingSummary,
    items: [
      {
        id: "briefing",
        route: "briefing",
        title: "Items in your first briefing",
        detail: content.briefingHighlight,
        lead: {
          _tag: "count",
          value: String(content.firstBriefingCount),
          tone: "brand",
        },
      },
      {
        id: "analysis",
        route: "analysis",
        title: "Reports ready in Analysis",
        detail: `Picked for ${client.name} from our existing research`,
        lead: {
          _tag: "count",
          value: String(content.readyReports),
          tone: "navy",
        },
      },
      {
        id: "contact",
        route: "contact",
        title: "Questions along the way?",
        detail: `Contact ${site.name} about a report or what to look at next.`,
        lead: { _tag: "chat" },
      },
    ],
  };
}
