import { describe, expect, it } from "vitest";

import { tabCount } from "./tab-count";

describe("tabCount", () => {
  it("shows a count", () => {
    expect(tabCount("6")).toBe("6");
    expect(tabCount("24")).toBe("24");
  });

  it("shows nothing for zero, or for no count at all", () => {
    expect(tabCount("0")).toBeUndefined();
    expect(tabCount("")).toBeUndefined();
    expect(tabCount(undefined)).toBeUndefined();
  });
});
