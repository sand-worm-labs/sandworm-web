import { describe, expect, it } from "vitest";

import { unlistedNotebookUrl } from "./notebookLinks";

describe("unlistedNotebookUrl", () => {
  it("is the public notebook page at the secret slug", () => {
    expect(
      unlistedNotebookUrl("https://app.sandwormlab.xyz", {
        visibility: "UNLISTED",
        slug: "my-notebook-AbCdEfGhIjKlMnOpQrStUv",
      })
    ).toBe(
      "https://app.sandwormlab.xyz/notebooks/my-notebook-AbCdEfGhIjKlMnOpQrStUv"
    );
  });

  it("copes with a trailing slash on the site address", () => {
    expect(
      unlistedNotebookUrl("https://app.sandwormlab.xyz/", {
        visibility: "UNLISTED",
        slug: "a-b",
      })
    ).toBe("https://app.sandwormlab.xyz/notebooks/a-b");
  });

  it("is nothing for a notebook that is not unlisted, so a public address is never shown as a secret one", () => {
    ["PUBLIC", "LINK", "WORKSPACE", undefined].forEach(visibility => {
      expect(
        unlistedNotebookUrl("https://x.test", { visibility, slug: "a-b" })
      ).toBeNull();
    });
  });

  it("is nothing before the notebook has an address", () => {
    expect(
      unlistedNotebookUrl("https://x.test", {
        visibility: "UNLISTED",
        slug: null,
      })
    ).toBeNull();
  });
});
