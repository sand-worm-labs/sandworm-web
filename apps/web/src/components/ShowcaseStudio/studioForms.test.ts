import { describe, expect, it } from "vitest";

import {
  EMPTY_NOTEBOOK_FORM,
  formProblems,
  parseHeroStats,
  parseList,
  toForm,
  toShowcase,
} from "./studioForms";

describe("lists", () => {
  it("splits on commas and new lines, trims, and drops blanks and repeats", () => {
    expect(parseList(" solana, base\n\nsolana ,  ")).toEqual([
      "solana",
      "base",
    ]);
  });

  it("reads one stat per line, keeping the cell when there is one", () => {
    expect(
      parseHeroStats(
        "Volume | $4.2M | volume_cell\nUsers | 12k\nbroken\n | no label"
      )
    ).toEqual([
      { label: "Volume", value: "$4.2M", cell: "volume_cell" },
      { label: "Users", value: "12k" },
    ]);
  });
});

describe("form <-> metadata", () => {
  it("round-trips an analysis", () => {
    const showcase = {
      kind: "case_study" as const,
      category: "off-ramps",
      protocol: "Paj",
      chains: ["solana", "base"],
      country: "Nigeria",
      status: "published" as const,
      dataAsOf: "2026-10-01",
      heroStats: [{ label: "Volume", value: "$4.2M" }],
      claimed: true,
    };

    expect(toShowcase(toForm(showcase))).toMatchObject(showcase);
  });

  it("starts empty when a notebook is not on the Showcase", () => {
    expect(toForm(null)).toEqual(EMPTY_NOTEBOOK_FORM);
  });

  it("leaves out what does not apply to the kind", () => {
    const sent = toShowcase({
      ...EMPTY_NOTEBOOK_FORM,
      kind: "category",
      category: "off-ramps",
      protocol: "Paj",
      parentCaseStudy: "paj",
      claimed: true,
    });

    expect(sent.protocol).toBeUndefined();
    expect(sent.parentCaseStudy).toBeUndefined();
    expect(sent.claimed).toBe(false);
  });
});

describe("problems", () => {
  it("asks for a category, and a protocol on an analysis", () => {
    expect(formProblems(EMPTY_NOTEBOOK_FORM)).toEqual([
      "Pick a category",
      "An analysis needs a protocol",
    ]);
    expect(
      formProblems({ ...EMPTY_NOTEBOOK_FORM, category: "x", protocol: "Paj" })
    ).toEqual([]);
  });

  it("allows at most four stats", () => {
    const heroStats = "a|1\nb|2\nc|3\nd|4\ne|5";
    expect(
      formProblems({
        ...EMPTY_NOTEBOOK_FORM,
        category: "x",
        protocol: "p",
        heroStats,
      })
    ).toEqual(["At most 4 headline stats"]);
  });
});
