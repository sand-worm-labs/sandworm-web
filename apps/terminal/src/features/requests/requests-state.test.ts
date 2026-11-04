import { describe, expect, it } from "vitest";

import {
  approveScope,
  canApprove,
  isResearchUsedUp,
  pickDefaultRequest,
  withApprovedResearch,
} from "./requests-state";
import type { Allowance, ResearchRequest } from "./types";

const scoping: ResearchRequest = {
  id: "solana",
  title: "Solana token demand",
  by: "Diego Ruiz · Mon 2 Nov",
  status: "Scoping",
  next: "Scope ready for you",
  steps: [
    { id: "submitted", label: "Submitted", state: "done", when: "Mon 2 Nov" },
    {
      id: "scoping",
      label: "Scoping",
      state: "next",
      when: "Scope sent today",
    },
    { id: "in-progress", label: "In progress", state: "later" },
    { id: "delivered", label: "Delivered", state: "later" },
  ],
  note: { when: "Today, 08:30", text: "Here is the scope." },
  scopeApproval: { scopedOn: "Tue 3 Nov", due: "Due Fri 20 Nov" },
};

const submitted: ResearchRequest = {
  ...scoping,
  id: "brazil",
  status: "Submitted",
  scopeApproval: undefined,
};

const allowance: Allowance = {
  research: { used: 4, total: 5 },
  calls: { used: 1, total: 4 },
  resetsOn: "1 Jan 2027",
  resetsShort: "1 Jan",
  resetsMonth: "January",
};

describe("canApprove", () => {
  it("needs a scope that was sent", () => {
    expect(canApprove(scoping)).toBe(true);
    expect(canApprove(submitted)).toBe(false);
  });
});

describe("approveScope", () => {
  it("starts the work and moves the timeline on", () => {
    const approved = approveScope(scoping);

    expect(approved.status).toBe("In progress");
    expect(approved.next).toBe("Due Fri 20 Nov");
    expect(approved.steps.map(step => step.state)).toEqual([
      "done",
      "done",
      "next",
      "later",
    ]);
    expect(approved.steps[1]?.when).toBe("Tue 3 Nov");
    expect(approved.steps[2]?.when).toBe("Just now");
    expect(approved.steps[3]?.when).toBe("Due Fri 20 Nov");
  });

  it("cannot be approved twice", () => {
    const approved = approveScope(scoping);

    expect(canApprove(approved)).toBe(false);
    expect(approveScope(approved)).toBe(approved);
  });

  it("leaves a request without a scope alone", () => {
    expect(approveScope(submitted)).toBe(submitted);
  });

  it("does not mutate the original", () => {
    approveScope(scoping);

    expect(scoping.status).toBe("Scoping");
  });
});

describe("allowance", () => {
  it("adds approved research to the used count", () => {
    expect(withApprovedResearch(allowance, 1).research.used).toBe(5);
  });

  it("is used up once research reaches the total", () => {
    expect(isResearchUsedUp(allowance)).toBe(false);
    expect(isResearchUsedUp(withApprovedResearch(allowance, 1))).toBe(true);
  });
});

describe("pickDefaultRequest", () => {
  it("prefers a request waiting for approval, then the first", () => {
    expect(pickDefaultRequest([submitted, scoping])?.id).toBe("solana");
    expect(pickDefaultRequest([submitted])?.id).toBe("brazil");
    expect(pickDefaultRequest([])).toBeUndefined();
  });
});
