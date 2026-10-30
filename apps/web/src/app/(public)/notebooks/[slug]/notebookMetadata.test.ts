import { describe, expect, it } from "vitest";

import {
  buildNotebookMetadata,
  type PublishedDocMeta,
} from "./notebookMetadata";

const doc = (overrides: Partial<PublishedDocMeta> = {}): PublishedDocMeta => ({
  title: "Who really holds PENGU?",
  description: "A look at the holders",
  tags: ["solana"],
  visibility: "PUBLIC",
  publishedAt: "2026-10-14T00:00:00Z",
  updatedAt: "2026-10-15T00:00:00Z",
  author: { username: "ada", firstName: null, lastName: null },
  ...overrides,
});

describe("buildNotebookMetadata", () => {
  it("lets search engines index a public notebook, at its canonical address", () => {
    const meta = buildNotebookMetadata(doc(), "pengu-1234abcd");
    expect(meta.robots).toBeUndefined();
    expect(meta.alternates).toEqual({ canonical: "/notebooks/pengu-1234abcd" });
    expect(meta.referrer).toBeUndefined();
  });

  it("asks search engines to skip an unlisted notebook, and not to hand its address to the sites it links to", () => {
    const meta = buildNotebookMetadata(
      doc({ visibility: "UNLISTED" }),
      "pengu-AbCdEf"
    );
    expect(meta.robots).toMatchObject({
      index: false,
      follow: false,
      nocache: true,
    });
    expect(meta.robots).toMatchObject({
      googleBot: { index: false, follow: false, noimageindex: true },
    });
    expect(meta.referrer).toBe("no-referrer");
  });

  it("does not name a canonical address for an unlisted notebook", () => {
    expect(
      buildNotebookMetadata(doc({ visibility: "UNLISTED" }), "pengu-AbCdEf")
        .alternates
    ).toBeUndefined();
  });

  it("still gives an unlisted link a title for the preview it is shared with", () => {
    const meta = buildNotebookMetadata(
      doc({ visibility: "UNLISTED" }),
      "pengu-AbCdEf"
    );
    expect(meta.title).toBe("Who really holds PENGU?");
    expect(meta.openGraph).toMatchObject({ title: "Who really holds PENGU?" });
  });

  it("says nothing when the notebook could not be read", () => {
    expect(buildNotebookMetadata(null, "x")).toEqual({});
    expect(buildNotebookMetadata(doc({ title: null }), "x")).toEqual({});
  });
});
