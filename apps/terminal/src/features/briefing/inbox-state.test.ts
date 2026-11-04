import { describe, expect, it } from "vitest";

import {
  countUnread,
  filterItems,
  isUnread,
  resolveSelected,
} from "./inbox-state";
import type { BriefingItem, BriefingKind } from "./types";

const item = (
  id: string,
  kind: BriefingKind,
  isUnreadAtStart: boolean
): BriefingItem => ({
  id,
  group: "Today",
  kind,
  title: id,
  summary: "",
  entity: "",
  time: "",
  when: "",
  isUnread: isUnreadAtStart,
  detail: {},
  action: { label: "Open", route: "overview" },
});

const items = [
  item("a", "Analysis", true),
  item("b", "Metric", true),
  item("c", "Analysis", false),
];

describe("filterItems", () => {
  it("keeps everything for 'all'", () => {
    expect(filterItems(items, "all")).toHaveLength(3);
  });

  it("keeps only the chosen kind", () => {
    expect(filterItems(items, "Analysis").map(entry => entry.id)).toEqual([
      "a",
      "c",
    ]);
  });
});

describe("unread tracking", () => {
  it("an item that arrived read is never unread", () => {
    expect(isUnread(items[2]!, [])).toBe(false);
  });

  it("an unread item stops being unread once it is opened", () => {
    expect(isUnread(items[0]!, [])).toBe(true);
    expect(isUnread(items[0]!, ["a"])).toBe(false);
  });

  it("counts what is still unread", () => {
    expect(countUnread(items, [])).toBe(2);
    expect(countUnread(items, ["a", "b"])).toBe(0);
  });
});

describe("resolveSelected", () => {
  it("returns the selected item when it is in view", () => {
    expect(resolveSelected(items, "b")?.id).toBe("b");
  });

  it("falls back to the first item when the selection is filtered out", () => {
    const analysis = filterItems(items, "Analysis");

    expect(resolveSelected(analysis, "b")?.id).toBe("a");
  });

  it("returns nothing when there is nothing to show", () => {
    expect(resolveSelected([], "a")).toBeUndefined();
  });
});
