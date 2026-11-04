import { describe, expect, it } from "vitest";

import {
  canSubmit,
  describeDraft,
  emptyDraft,
  formatSubmittedAt,
  submittedTimeline,
} from "./draft";

describe("canSubmit", () => {
  it("needs a question that is not just whitespace", () => {
    expect(canSubmit(emptyDraft())).toBe(false);
    expect(canSubmit({ ...emptyDraft(), question: "   " })).toBe(false);
    expect(canSubmit({ ...emptyDraft(), question: "Is Pix worth it?" })).toBe(
      true
    );
  });
});

describe("describeDraft", () => {
  it("joins what the request is for, about and when", () => {
    const draft = {
      ...emptyDraft(),
      about: ["Brazil", "Cash-out and off-ramps"],
    };

    expect(describeDraft(draft)).toBe(
      "For: Plan a launch · About: Brazil, Cash-out and off-ramps · In about 2 weeks"
    );
  });

  it("leaves out an empty About", () => {
    expect(describeDraft({ ...emptyDraft(), timing: "no-rush" })).toBe(
      "For: Plan a launch · No rush"
    );
  });
});

describe("formatSubmittedAt", () => {
  it("pads the time to two digits", () => {
    expect(formatSubmittedAt(new Date(2026, 10, 4, 9, 5))).toBe("Today, 09:05");
    expect(formatSubmittedAt(new Date(2026, 10, 4, 18, 40))).toBe(
      "Today, 18:40"
    );
  });
});

describe("submittedTimeline", () => {
  it("is done, then one current step, then two to come", () => {
    const steps = submittedTimeline("Today, 10:42", "Tobi");

    expect(steps.map(step => step.state)).toEqual([
      "done",
      "next",
      "later",
      "later",
    ]);
    expect(steps[0]?.detail).toBe("Today, 10:42");
    expect(steps[1]?.detail).toContain("Tobi");
  });
});
