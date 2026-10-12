import { describe, expect, it } from "vitest";

import {
  isNotebookTrusted,
  isOwnNotebook,
  setNotebookOwner,
  trustNotebook,
} from "./trust";

describe("whose notebooks run", () => {
  it("doesn't trust a notebook it knows nothing about", () => {
    expect(isNotebookTrusted("unknown")).toBe(false);
    expect(isOwnNotebook("unknown")).toBe(false);
  });

  it("runs the reader's own notebook without asking", () => {
    setNotebookOwner("mine", true);
    expect(isOwnNotebook("mine")).toBe(true);
    expect(isNotebookTrusted("mine")).toBe(true);
  });

  it("leaves someone else's notebook untrusted until the reader agrees", () => {
    setNotebookOwner("theirs", false);
    expect(isNotebookTrusted("theirs")).toBe(false);

    trustNotebook("theirs");
    expect(isNotebookTrusted("theirs")).toBe(true);
    // Agreeing to run it doesn't make it theirs: its output is still labelled.
    expect(isOwnNotebook("theirs")).toBe(false);
  });

  it("keeps each notebook's answer to itself", () => {
    trustNotebook("one");
    expect(isNotebookTrusted("two")).toBe(false);
  });
});
