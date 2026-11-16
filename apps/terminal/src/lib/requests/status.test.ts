import { RequestStatusId } from "@sandworm/types/terminal";
import { describe, expect, it } from "vitest";

import { request } from "@/_mockdata/requests/builders";

import { approveScope } from "./requests-state";
import { canApprove, nextOf, researchStatus, stepsOf } from "./status";

const scoped = request({
  question: "Where do users go next?",
  status: RequestStatusId.AWAITING_APPROVAL,
  submittedAt: "2026-11-02T09:00:00.000Z",
  scopedAt: "2026-11-03T09:00:00.000Z",
  scope: {
    summary: "A scope.",
    questions: ["One question."],
    sources: [],
    dueAt: "2026-11-20T09:00:00.000Z",
  },
});

describe("request status", () => {
  it("reads a scope waiting for approval as scoping, with the scope next", () => {
    expect(researchStatus(scoped)).toBe("Scoping");
    expect(nextOf(scoped)).toBe("Scope ready for you");
    expect(stepsOf(scoped).map(step => step.state)).toEqual([
      "done",
      "next",
      "later",
      "later",
    ]);
  });

  it("can be approved only while the scope waits", () => {
    expect(canApprove(scoped)).toBe(true);
    expect(canApprove({ ...scoped, status: RequestStatusId.IN_PROGRESS })).toBe(
      false
    );
  });

  it("moves to in progress, with a due date, once approved", () => {
    const approved = approveScope(scoped);

    expect(researchStatus(approved)).toBe("In progress");
    expect(nextOf(approved)).toMatch(/^Due /);
    expect(stepsOf(approved).map(step => step.state)).toEqual([
      "done",
      "done",
      "next",
      "later",
    ]);
  });

  it("ends a declined request after submitting", () => {
    const declined = request({
      question: "NFTs",
      status: RequestStatusId.DECLINED,
      submittedAt: "2026-10-01T09:00:00.000Z",
      closedAt: "2026-10-02T09:00:00.000Z",
    });

    expect(stepsOf(declined).map(step => step.state)).toEqual([
      "done",
      "declined",
    ]);
    expect(nextOf(declined)).toBe("Didn't count");
  });
});
