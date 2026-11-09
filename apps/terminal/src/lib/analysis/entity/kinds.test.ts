import { describe, expect, it } from "vitest";
import { AnalysisViewKind } from "@sandworm/types/terminal";

import { isEntityKind } from "./kinds";

describe("isEntityKind", () => {
  it.each(Object.values(AnalysisViewKind))("accepts %s", kind => {
    expect(isEntityKind(kind)).toBe(true);
  });

  it("rejects anything else, including a different case", () => {
    expect(isEntityKind("Project")).toBe(false);
    expect(isEntityKind("")).toBe(false);
  });
});
