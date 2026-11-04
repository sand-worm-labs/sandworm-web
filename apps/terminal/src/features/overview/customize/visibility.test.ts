import { describe, expect, it } from "vitest";

import { toggleId } from "./visibility";

describe("toggleId", () => {
  it("adds an id that is not there", () => {
    expect(toggleId(["a"], "b")).toEqual(["a", "b"]);
  });

  it("removes an id that is already there", () => {
    expect(toggleId(["a", "b"], "a")).toEqual(["b"]);
  });

  it("does not change the list it was given", () => {
    const ids = ["a"] as const;
    toggleId(ids, "b");

    expect(ids).toEqual(["a"]);
  });
});
