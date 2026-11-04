import { describe, expect, it } from "vitest";

import { ORGANISATION_TYPES } from "@/features/setup/options/organisation-types";

import { overviewFixtures } from ".";

const fixtures = Object.values(overviewFixtures);

describe("overview fixtures", () => {
  it("has one for every organisation type", () => {
    expect(Object.keys(overviewFixtures).sort()).toEqual(
      ORGANISATION_TYPES.map(type => type.id).sort()
    );
  });

  it.each(fixtures)("$clientKind: block ids are unique", data => {
    const ids = data.blocks.map(block => block.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(fixtures)(
    "$clientKind: the layout only places blocks that exist, once each",
    data => {
      const blockIds = new Set(data.blocks.map(block => block.id));
      const placed = data.layout.flatMap(row =>
        row.columns.flatMap(column => column.blockIds)
      );

      expect(placed.every(id => blockIds.has(id))).toBe(true);
      expect(new Set(placed).size).toBe(placed.length);
    }
  );

  it.each(fixtures)("$clientKind: every row adds up to 12 columns", data => {
    data.layout.forEach(row => {
      const total = row.columns.reduce((sum, column) => sum + column.span, 0);

      expect(total).toBe(12);
    });
  });
});
