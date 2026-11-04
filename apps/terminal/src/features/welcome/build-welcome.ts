import type { Session } from "@/features/session/types";

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
        id: "kickoff",
        route: "bookCall",
        title: `Kick-off call, ${client.kickoffCall.when}`,
        detail: `${client.kickoffCall.minutes} minutes with ${client.analyst.name}. Change the time if it doesn't suit.`,
        lead: { _tag: "calendar" },
      },
    ],
  };
}
