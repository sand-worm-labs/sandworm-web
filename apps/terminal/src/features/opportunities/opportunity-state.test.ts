import { describe, expect, it } from "vitest";

import { filterOpportunities, groupByStatus } from "./opportunity-state";
import type { Opportunity, OpportunityStatus } from "./types";

const item = (id: string, status: OpportunityStatus): Opportunity => ({
  id,
  status,
  title: id,
  summary: "",
  kind: "Product gap",
  value: "$1",
  valueLabel: "",
  confidence: "High",
  when: "Today",
});

const items = [
  item("a", "Passed"),
  item("b", "New"),
  item("c", "Pursuing"),
  item("d", "New"),
  item("e", "Reviewing"),
];

describe("filterOpportunities", () => {
  it("keeps every open status and drops passed ones for open", () => {
    expect(filterOpportunities(items, "open").map(i => i.id)).toEqual([
      "b",
      "c",
      "d",
      "e",
    ]);
  });

  it("keeps only the chosen status", () => {
    expect(filterOpportunities(items, "New").map(i => i.id)).toEqual([
      "b",
      "d",
    ]);
    expect(filterOpportunities(items, "Passed").map(i => i.id)).toEqual(["a"]);
  });
});

describe("groupByStatus", () => {
  it("orders groups by status, keeps item order and skips empty groups", () => {
    const groups = groupByStatus(filterOpportunities(items, "open"));

    expect(groups.map(g => g.status)).toEqual(["New", "Reviewing", "Pursuing"]);
    expect(groups[0]?.items.map(i => i.id)).toEqual(["b", "d"]);
  });

  it("returns nothing for no items", () => {
    expect(groupByStatus([])).toEqual([]);
  });
});
