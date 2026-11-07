import { site } from "@/config/site";
import type { SetupProgress } from "@/lib/overview/types";

type SetupProgressInit = { clientName: string };

export function buildSetupProgress({
  clientName,
}: SetupProgressInit): SetupProgress {
  return {
    message: `${site.name} is confirming the contracts and wallets we'll track for ${clientName}. Your first briefing is expected on Thu 6 Nov.`,
    steps: [
      {
        id: "workspace",
        title: "Workspace created",
        detail: "Today, 09:12",
        isDone: true,
      },
      {
        id: "tracking",
        title: "Confirm what we track",
        detail: `${site.name} suggested 14 contracts and 3 competitors.`,
        isDone: false,
        action: { label: "Review", route: "setupTracking" },
      },
      {
        id: "team",
        title: "Invite your team",
        detail: "Add the people who should see this.",
        isDone: false,
        action: { label: "Invite", route: "setupGoals" },
      },
      {
        id: "briefing",
        title: "First briefing",
        detail: "Expected Thu 6 Nov, once your numbers are checked.",
        isDone: false,
      },
    ],
  };
}
