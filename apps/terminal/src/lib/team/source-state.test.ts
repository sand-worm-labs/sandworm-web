import { describe, expect, it } from "vitest";

import type { TeamClientDetail, TeamClientSource } from "@/types";

import {
  attentionFor,
  describeLastRun,
  describeSchedule,
} from "./source-state";

const NOW = new Date("2026-11-08T12:00:00");
const daysAgo = (days: number) =>
  new Date(NOW.getTime() - days * 86_400_000).toISOString();

const source = (init: Partial<TeamClientSource> = {}): TeamClientSource => ({
  documentId: "doc",
  title: "Fees by route",
  path: "/workspace/w/documents/doc",
  cells: 2,
  items: 3,
  lastRanAt: daysAgo(1),
  schedule: { isActive: true, nextRunAt: null, lastRunAt: null },
  ...init,
});

const client = (init: Partial<TeamClientDetail> = {}): TeamClientDetail => ({
  id: "c",
  name: "Acme",
  type: "exchange",
  plan: "pro",
  status: "live",
  adminEmail: "admin@acme.test",
  createdAt: daysAgo(90),
  website: "",
  description: "",
  members: 3,
  lastReadAt: daysAgo(1),
  openRequests: 0,
  newSignals: 0,
  researchAllowance: 5,
  sources: [source()],
  ...init,
});

describe("describeSchedule", () => {
  it("says when nothing is scheduled or it is paused", () => {
    expect(describeSchedule(null)).toBe("Not scheduled");
    expect(
      describeSchedule({ isActive: false, nextRunAt: null, lastRunAt: null })
    ).toBe("Paused");
  });

  it("says when it runs next", () => {
    expect(
      describeSchedule(
        { isActive: true, nextRunAt: "2026-11-09T06:00:00", lastRunAt: null },
        NOW
      )
    ).toBe("Runs tomorrow at 06:00");
    expect(
      describeSchedule(
        { isActive: true, nextRunAt: "2026-11-12T06:00:00", lastRunAt: null },
        NOW
      )
    ).toBe("Runs Thu 12 Nov at 06:00");
    expect(
      describeSchedule({ isActive: true, nextRunAt: null, lastRunAt: null })
    ).toBe("Scheduled");
  });
});

describe("describeLastRun", () => {
  it("is relative to today, or never", () => {
    expect(describeLastRun(source({ lastRanAt: daysAgo(1) }), NOW)).toBe(
      "Yesterday"
    );
    expect(describeLastRun(source({ lastRanAt: null }), NOW)).toBe("Never");
  });
});

describe("attentionFor", () => {
  it("has nothing to say about a client that is read and up to date", () => {
    expect(attentionFor(client(), NOW)).toEqual([]);
  });

  it("flags a setup that is not finished and an invite nobody accepted", () => {
    expect(attentionFor(client({ status: "setting_up" }), NOW)).toEqual([
      { id: "setup", text: "Setup is not finished." },
    ]);
    expect(
      attentionFor(client({ status: "invite_sent" }), NOW).map(i => i.text)
    ).toEqual(["Waiting for admin@acme.test to sign in."]);
  });

  it("flags a live client that has not read the briefing in two weeks, or ever", () => {
    expect(
      attentionFor(client({ lastReadAt: daysAgo(20) }), NOW).map(i => i.text)
    ).toEqual(["Nobody has opened the briefing in 20 days."]);
    expect(
      attentionFor(client({ lastReadAt: null }), NOW).map(i => i.text)
    ).toEqual(["Nobody has opened the briefing yet."]);
  });

  it("does not ask for readers a client does not have yet", () => {
    expect(attentionFor(client({ members: 0, lastReadAt: null }), NOW)).toEqual(
      []
    );
  });

  it("flags a notebook that has gone stale with no schedule, but not a scheduled one", () => {
    const stale = source({
      documentId: "a",
      title: "Old",
      lastRanAt: daysAgo(10),
      schedule: null,
    });
    const never = source({
      documentId: "b",
      title: "New",
      lastRanAt: null,
      schedule: null,
    });
    const scheduled = source({ documentId: "c", lastRanAt: daysAgo(30) });

    expect(
      attentionFor(client({ sources: [stale, never, scheduled] }), NOW).map(
        i => i.text
      )
    ).toEqual([
      "Old has not run in 10 days and is not scheduled.",
      "New has never been run and is not scheduled.",
    ]);
  });
});
