import { describe, expect, it } from "vitest";

import { toId } from "./slug";

describe("toId", () => {
  it("lowercases and joins words with dashes", () => {
    expect(toId("Swap volume")).toBe("swap-volume");
  });

  it("drops punctuation and trims stray dashes", () => {
    expect(toId("Argentina's off-ramps, 2× fees!")).toBe(
      "argentina-s-off-ramps-2-fees"
    );
  });
});
