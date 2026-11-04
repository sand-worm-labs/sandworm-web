import type { RequestsData } from "@/features/requests/types";

import { questionEntry, researchRequest, step } from "./builders";

export const exchangeRequests: RequestsData = {
  allowance: {
    research: { used: 2, total: 5 },
    resetsOn: "1 Jan 2027",
    resetsShort: "1 Jan",
    resetsMonth: "January",
  },
  research: [
    researchRequest({
      title: "Brazil cash-out: users, apps and fees",
      by: "Maya Chen · today",
      status: "Submitted",
      next: "Waiting for scope",
      steps: [
        step("Submitted", "done", "Today, 10:42"),
        step("Scoping", "next"),
        step("In progress", "later"),
        step("Delivered", "later"),
      ],
      note: {
        when: "Today, 11:05",
        text: "Got it. I will send a scope after I check how much Brazil data we have for your users.",
      },
    }),
    researchRequest({
      title: "Solana token demand among our users",
      by: "Diego Ruiz · Mon 2 Nov",
      status: "Scoping",
      next: "Scope ready for you",
      steps: [
        step("Submitted", "done", "Mon 2 Nov"),
        step("Scoping", "next", "Scope sent today"),
        step("In progress", "later"),
        step("Delivered", "later"),
      ],
      note: {
        when: "Today, 08:30",
        text: "Here is the scope. I will answer three questions:\n1. How many of your users hold Solana tokens you do not list.\n2. Which tokens, ranked by how much they hold.\n3. How much they trade each month.\nAbout 2 weeks from approval.",
      },
      scopeApproval: { scopedOn: "Tue 3 Nov", due: "Due Fri 20 Nov" },
    }),
    researchRequest({
      title: "Stablecoin yield: what would it take?",
      by: "Maya Chen · 20 Oct",
      status: "In progress",
      next: "Due Fri 13 Nov",
      steps: [
        step("Submitted", "done", "20 Oct"),
        step("Scoping", "done", "22 Oct"),
        step("In progress", "next", "Since 23 Oct"),
        step("Delivered", "later", "Due Fri 13 Nov"),
      ],
      note: {
        when: "Fri 30 Oct",
        text: "On track. First finding: 38,000 of your wallets earn on Aave, and most would accept 4% or more.",
      },
    }),
    researchRequest({
      title: "LatAm cash-out sizing",
      by: "Maya Chen · 14 Oct",
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
        text: "Delivered. It also led to the Argentina opportunity in your list.",
      },
      reportLabel: "Read the report",
    }),
    researchRequest({
      title: "NFT trading among our users",
      by: "Diego Ruiz · 1 Oct",
      status: "Declined",
      next: "Didn't count",
      steps: [
        step("Submitted", "done", "1 Oct"),
        step("Declined", "declined", "2 Oct"),
      ],
      note: {
        when: "2 Oct",
        text: "Too few of your users trade NFTs for a useful answer. This did not use your allowance.",
      },
    }),
  ],
  questions: [
    questionEntry({
      title: "Does the 2.2% include the exchange-rate spread?",
      detail:
        "Sandworm: Yes. It is the full cost of cashing out, spread included.",
      status: "Answered",
      when: "Mon 2 Nov",
    }),
  ],
};
