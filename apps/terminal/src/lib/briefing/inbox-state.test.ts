import {
  BriefingKindId,
  type BriefingItemData,
} from "@sandworm/types/terminal";
import { describe, expect, it } from "vitest";

import {
  countByFilter,
  countUnread,
  filterItems,
  groupBriefing,
  neighbourOf,
  resolveSelected,
  stateOf,
} from "./inbox-state";

const now = new Date("2026-11-09T12:00:00");
const daysBefore = (days: number) =>
  new Date(now.getTime() - days * 86_400_000).toISOString();

const item = (
  id: string,
  init: Partial<BriefingItemData> = {}
): BriefingItemData => ({
  id,
  kind: BriefingKindId.METRIC,
  title: id,
  summary: "",
  subject: "Paycrest",
  detail: {},
  publishedAt: daysBefore(0),
  isRead: false,
  isArchived: false,
  sourcePath: null,
  ...init,
});

const items = [
  item("fresh"),
  item("signal", { kind: BriefingKindId.SIGNAL, isRead: true }),
  item("old", { publishedAt: daysBefore(10) }),
  item("away", { isRead: true, isArchived: true }),
];

describe("stateOf", () => {
  it("puts what the member did on this page over what the feed says", () => {
    expect(stateOf(items[0]!, { fresh: { isRead: true } })).toEqual({
      isRead: true,
      isArchived: false,
    });
  });
});

describe("filterItems", () => {
  it("keeps archived items out of every view but Archived", () => {
    expect(filterItems(items, {}, "all").map(i => i.id)).toEqual([
      "fresh",
      "signal",
      "old",
    ]);
    expect(filterItems(items, {}, "archived").map(i => i.id)).toEqual(["away"]);
  });

  it("filters to unread and to a kind", () => {
    expect(filterItems(items, {}, "unread").map(i => i.id)).toEqual([
      "fresh",
      "old",
    ]);
    expect(
      filterItems(items, {}, BriefingKindId.SIGNAL).map(i => i.id)
    ).toEqual(["signal"]);
  });

  it("follows what the member did on this page", () => {
    const overrides = {
      fresh: { isRead: true, isArchived: true },
      away: { isArchived: false },
    };
    expect(filterItems(items, overrides, "all").map(i => i.id)).toContain(
      "away"
    );
    expect(filterItems(items, overrides, "all").map(i => i.id)).not.toContain(
      "fresh"
    );
  });
});

describe("counts", () => {
  it("counts every filter, the unread ones not archived", () => {
    expect(countUnread(items, {})).toBe(2);
    expect(countByFilter(items, {})).toMatchObject({
      all: 3,
      unread: 2,
      archived: 1,
      signal: 1,
      metric: 2,
      analysis: 0,
    });
  });
});

describe("selection", () => {
  it("opens the item asked for, or the first", () => {
    expect(resolveSelected(items, "old")?.id).toBe("old");
    expect(resolveSelected(items, "gone")?.id).toBe("fresh");
    expect(resolveSelected([], undefined)).toBeUndefined();
  });

  it("moves to the next item when one leaves, or the one before at the end", () => {
    expect(neighbourOf(items, "fresh")).toBe("signal");
    expect(neighbourOf(items, "away")).toBe("old");
    expect(neighbourOf([items[0]!], "fresh")).toBeUndefined();
  });
});

describe("groupBriefing", () => {
  const lastSeenAt = daysBefore(1);

  it("puts what arrived since the last visit first, then days", () => {
    const groups = groupBriefing(items.slice(0, 3), lastSeenAt, now);

    expect(groups.map(g => g.label)).toEqual([
      expect.stringMatching(/^New since /),
      "Last week",
    ]);
    expect(groups[0]).toMatchObject({ isNew: true });
    expect(groups[0]?.items.map(i => i.id)).toEqual(["fresh", "signal"]);
  });

  it("has no new group on a first visit, or when nothing is new", () => {
    expect(groupBriefing(items, null, now).map(g => g.label)).toEqual([
      "Today",
      "Last week",
    ]);
    expect(
      groupBriefing([items[2]!], lastSeenAt, now).map(g => g.label)
    ).toEqual(["Last week"]);
  });
});
