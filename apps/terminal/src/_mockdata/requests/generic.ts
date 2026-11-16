import {
  RequestStatusId,
  type TerminalRequests,
} from "@sandworm/types/terminal";

import { ago } from "../ago";

import { request } from "./builders";
import { exchangeRequests } from "./exchange";

export const genericRequests = (userName: string): TerminalRequests => ({
  allowance: exchangeRequests().allowance,
  requests: [
    request({
      question: "Where our most active users go next",
      requestedBy: userName,
      status: RequestStatusId.AWAITING_APPROVAL,
      submittedAt: ago(0, "09:15"),
      scopedAt: ago(0, "10:20"),
      scope: {
        summary:
          "It follows your most active users to the products they move to.",
        questions: [
          "Which products your most active users move to.",
          "What made them move.",
        ],
        sources: [],
        dueAt: ago(-14),
      },
    }),
    request({
      question: "Who our new users are, by region",
      requestedBy: userName,
      status: RequestStatusId.DELIVERED,
      submittedAt: ago(20),
      scopedAt: ago(19),
      approvedAt: ago(18),
      closedAt: ago(8),
      outcome: "Delivered. It is in your Analysis.",
    }),
  ],
});
