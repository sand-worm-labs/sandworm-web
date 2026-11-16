import {
  RequestKindId,
  RequestStatusId,
  type TerminalRequests,
} from "@sandworm/types/terminal";
import { addQuarters, startOfQuarter } from "date-fns";

import { ago } from "../ago";

import { request } from "./builders";

export const exchangeRequests = (): TerminalRequests => ({
  allowance: {
    used: 2,
    total: 5,
    resetsAt: addQuarters(startOfQuarter(new Date()), 1).toISOString(),
  },
  requests: [
    request({
      question: "Brazil cash-out: users, apps and fees",
      requestedBy: "Alex Morgan",
      status: RequestStatusId.SUBMITTED,
      submittedAt: ago(0, "10:42"),
      progressNote:
        "Got it. I will send a scope after I check how much Brazil data we have for your users.",
    }),
    request({
      question: "Solana token demand among our users",
      requestedBy: "Diego Ruiz",
      status: RequestStatusId.AWAITING_APPROVAL,
      submittedAt: ago(1, "09:00"),
      scopedAt: ago(0, "08:30"),
      scope: {
        summary:
          "It sizes the Solana tokens your users hold that you do not list.",
        questions: [
          "How many of your users hold Solana tokens you do not list.",
          "Which tokens, ranked by how much they hold.",
          "How much they trade each month.",
        ],
        sources: [],
        dueAt: ago(-17),
      },
    }),
    request({
      question: "Stablecoin yield: what would it take?",
      requestedBy: "Alex Morgan",
      status: RequestStatusId.IN_PROGRESS,
      submittedAt: ago(14),
      scopedAt: ago(12),
      approvedAt: ago(11),
      scope: {
        summary: "It tests what yield would keep stablecoins in your app.",
        questions: ["What yield would your users accept."],
        sources: [],
        dueAt: ago(-10),
      },
      progressNote:
        "On track. First finding: 38,000 of your wallets earn on Aave, and most would accept 4% or more.",
    }),
    request({
      question: "LatAm cash-out sizing",
      requestedBy: "Alex Morgan",
      status: RequestStatusId.DELIVERED,
      submittedAt: ago(20),
      scopedAt: ago(19),
      approvedAt: ago(18),
      closedAt: ago(8),
      outcome: "Delivered. It also led to the Argentina signal in your list.",
    }),
    request({
      question: "NFT trading among our users",
      requestedBy: "Diego Ruiz",
      status: RequestStatusId.DECLINED,
      submittedAt: ago(33),
      closedAt: ago(32),
      outcome:
        "Too few of your users trade NFTs for a useful answer. This did not use your allowance.",
    }),
    request({
      question: "Does the 2.2% include the exchange-rate spread?",
      kind: RequestKindId.QUESTION,
      status: RequestStatusId.DELIVERED,
      submittedAt: ago(1, "10:00"),
      closedAt: ago(1, "14:00"),
      outcome: "Yes. It is the full cost of cashing out, spread included.",
    }),
  ],
});
