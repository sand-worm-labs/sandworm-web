import { describe, expect, it } from "vitest";

import { groupInOrder } from "./group-in-order";

const day = (item: { day: string }) => item.day;

describe("groupInOrder", () => {
  it("groups items and keeps the order the groups first appear in", () => {
    const groups = groupInOrder(
      [
        { day: "Today", n: 1 },
        { day: "Yesterday", n: 2 },
        { day: "Today", n: 3 },
      ],
      day
    );

    expect(groups.map(group => group.key)).toEqual(["Today", "Yesterday"]);
    expect(groups[0]?.items.map(item => item.n)).toEqual([1, 3]);
  });

  it("returns no groups for no items", () => {
    expect(groupInOrder([], day)).toEqual([]);
  });
});
