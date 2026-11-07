import type { RequestsData } from "@/types";

import { exchangeRequests } from "./exchange";
import { researchRequest, step } from "./builders";

export function genericRequests(userName: string): RequestsData {
  return {
    allowance: exchangeRequests.allowance,
    research: [
      researchRequest({
        title: "Where our most active users go next",
        by: `${userName} · today`,
        status: "Scoping",
        next: "Scope ready for you",
        steps: [
          step("Submitted", "done", "Today, 09:15"),
          step("Scoping", "next", "Scope sent today"),
          step("In progress", "later"),
          step("Delivered", "later"),
        ],
        note: {
          when: "Today, 10:20",
          text: "Here is the scope. I will answer two questions:\n1. Which products your most active users move to.\n2. What made them move.\nAbout 2 weeks from approval.",
        },
        scopeApproval: { scopedOn: "Today", due: "Due in about 2 weeks" },
      }),
      researchRequest({
        title: "Who our new users are, by region",
        by: `${userName} · 14 Oct`,
        status: "Delivered",
        next: "Mon 26 Oct",
        steps: [
          step("Submitted", "done", "14 Oct"),
          step("Scoping", "done", "15 Oct"),
          step("In progress", "done", "16 Oct"),
          step("Delivered", "done", "Mon 26 Oct"),
        ],
        note: {
          when: "Mon 26 Oct",
          text: "Delivered. It is in your Analysis.",
        },
        reportLabel: "Read the report",
      }),
    ],
    questions: [],
  };
}
