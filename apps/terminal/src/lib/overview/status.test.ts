import { describe, expect, it } from "vitest";

import { OVERVIEW_STATUSES, isOverviewStatus } from "./status";

describe("isOverviewStatus", () => {
  it.each(OVERVIEW_STATUSES)("accepts %s", status => {
    expect(isOverviewStatus(status)).toBe(true);
  });

  it("rejects anything else", () => {
    expect(isOverviewStatus("loading")).toBe(false);
  });
});
