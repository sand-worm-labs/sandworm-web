import { describe, expect, it } from "vitest";

import type { ShowcaseTemplates } from "@/types";

import { checkTemplate as check, markdownHeadings } from "./showcaseTemplate";

// The sections a notebook's author writes, as the database holds them.
const templates: ShowcaseTemplates = {
  case_study: {
    sections: [
      {
        id: "short_version",
        title: "The short version",
        required: true,
        by: "notebook",
      },
      {
        id: "findings",
        title: null,
        required: true,
        min: 3,
        max: 5,
        by: "notebook",
      },
      {
        id: "limits",
        title: "What this page doesn't cover",
        required: true,
        by: "notebook",
      },
    ],
  },
  category: {
    sections: [
      {
        id: "metrics",
        title: "Category metrics",
        required: true,
        min: 4,
        max: 5,
        by: "notebook",
      },
      {
        id: "leaderboard",
        title: "Leaderboard",
        required: true,
        by: "notebook",
      },
      {
        id: "coverage_note",
        title: "Coverage note",
        required: true,
        by: "notebook",
      },
    ],
  },
};

const checkTemplate = (kind: keyof ShowcaseTemplates, titles: string[]) =>
  check(kind, titles, templates);

describe("markdownHeadings", () => {
  it("finds the H2s of a cell, and only the H2s", () => {
    const source = [
      "# Title",
      "## The short version",
      "### A detail",
      "text ## not a heading",
      "```",
      "## inside code",
      "```",
      "## **Who** cashes out ##",
    ].join("\n");

    expect(markdownHeadings(source)).toEqual([
      "The short version",
      "Who cashes out",
    ]);
  });
});

describe("checkTemplate", () => {
  const caseStudy = [
    "The short version",
    "Cash-outs grew 34%",
    "A few wallets do most of it",
    "Fridays are the busy day",
    "What this page doesn't cover",
  ];

  it("accepts a case study with every fixed section and 3 to 5 findings", () => {
    expect(checkTemplate("case_study", caseStudy)).toEqual([]);
  });

  it("says which fixed sections are missing", () => {
    expect(checkTemplate("case_study", caseStudy.slice(0, 4))).toEqual([
      `Missing the "What this page doesn't cover" section`,
    ]);
  });

  it("asks a category notebook only for the sections its author writes", () => {
    expect(checkTemplate("category", ["Leaderboard"])).toEqual([
      `Missing the "Category metrics" section`,
      `Missing the "Coverage note" section`,
    ]);
  });

  it("says when there are too few findings", () => {
    const problems = checkTemplate("case_study", [
      "The short version",
      "One finding",
      "What this page doesn't cover",
    ]);

    expect(problems).toEqual(["Needs 3 to 5 findings sections, has 1"]);
  });
});
