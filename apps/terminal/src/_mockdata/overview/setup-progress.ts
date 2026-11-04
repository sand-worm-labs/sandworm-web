import type { SetupProgress } from "../types";

type SetupProgressInit = { clientName: string; analystName: string };

export function buildSetupProgress({
  clientName,
  analystName,
}: SetupProgressInit): SetupProgress {
  return {
    message: `${analystName} is confirming the contracts and wallets we'll track for ${clientName}. Your first briefing is expected on Thu 6 Nov.`,
    kickoffMessage:
      "Your kick-off call is on Thu 5 Nov at 15:00. Bring the questions you most want answered.",
    steps: [
      {
        id: "workspace",
        title: "Workspace created",
        detail: "Today, 09:12",
        isDone: true,
      },
      {
        id: "call",
        title: "Kick-off call booked",
        detail: `Thu 5 Nov, 15:00 with ${analystName}`,
        isDone: true,
      },
      {
        id: "tracking",
        title: "Confirm what we track",
        detail: `${analystName} suggested 14 contracts and 3 competitors.`,
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
