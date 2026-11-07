import { describe, expect, it } from "vitest";

import { ENTITY_KINDS, isEntityKind } from "./kinds";

describe("isEntityKind", () => {
  it.each(ENTITY_KINDS)("accepts %s", kind => {
    expect(isEntityKind(kind)).toBe(true);
  });

  it("rejects anything else, including a different case", () => {
    expect(isEntityKind("Project")).toBe(false);
    expect(isEntityKind("")).toBe(false);
  });
});
