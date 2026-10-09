import { describe, expect, it } from "vitest";

import type { ShowcaseNotebook, ShowcaseTaxonomy } from "@/types";

import {
  buildCategoryCards,
  caseStudyHref,
  chainsPresent,
  filterCards,
  findCaseStudy,
  groupCounts,
} from "./showcase";
import { readUtm, withUtm } from "./utm";

const taxonomy: ShowcaseTaxonomy = {
  groups: [
    { id: "money", label: "Money" },
    { id: "trading", label: "Trading" },
  ],
  chainOrder: ["Solana", "Base"],
  categories: [
    {
      group: "money",
      slug: "off-ramps",
      name: "Off-ramps",
      question: "Who is cashing out?",
      metricSpec: "off_ramps",
      protocols: ["Yellow Card"],
    },
    {
      group: "money",
      slug: "stablecoins",
      name: "Stablecoins",
      question: "Which stablecoins pay people?",
      metricSpec: "stablecoins",
      chains: ["Ethereum"],
    },
    {
      group: "trading",
      slug: "dexes",
      name: "DEXes",
      question: "Where does real trading happen?",
      metricSpec: "dexes",
    },
  ],
};

const notebook = (
  slug: string,
  showcase: Partial<ShowcaseNotebook["showcase"]>
): ShowcaseNotebook => ({
  id: slug,
  slug,
  title: slug,
  description: null,
  publishedAt: "2026-10-01T00:00:00Z",
  author: "official",
  showcase: {
    kind: "category",
    category: "off-ramps",
    chains: [],
    status: "published",
    heroStats: [],
    ...showcase,
  },
});

const paj = notebook("just-paj-it", {
  kind: "case_study",
  protocol: "Paj Cash",
  chains: ["Solana"],
  country: "Nigeria",
});

describe("buildCategoryCards", () => {
  it("makes one card per taxonomy entry, so a new entry is a new card", () => {
    const cards = buildCategoryCards([], taxonomy);
    const more = buildCategoryCards([], {
      ...taxonomy,
      categories: [
        ...taxonomy.categories,
        { ...taxonomy.categories[0]!, slug: "payments", name: "Payments" },
      ],
    });

    expect(cards.map(c => c.slug)).toEqual([
      "off-ramps",
      "stablecoins",
      "dexes",
    ]);
    expect(more.at(-1)).toMatchObject({ slug: "payments", status: "request" });
  });

  it("works out each category's status from its notebooks", () => {
    const cards = buildCategoryCards(
      [paj, notebook("stables", { category: "stablecoins", chains: ["Base"] })],
      taxonomy
    );
    const status = Object.fromEntries(cards.map(c => [c.slug, c.status]));

    expect(status).toEqual({
      "off-ramps": "live",
      stablecoins: "building",
      dexes: "request",
    });
  });

  it("lists covered protocols before planned ones, and counts case studies", () => {
    const [offRamps] = buildCategoryCards([paj], taxonomy);

    expect(offRamps).toMatchObject({
      protocols: ["Paj Cash", "Yellow Card"],
      caseStudyCount: 1,
      chains: ["Solana"],
      countries: ["Nigeria"],
    });
  });
});

describe("case studies", () => {
  it("live under their category, at a link made from the protocol", () => {
    expect(caseStudyHref(paj)).toBe("/showcase/off-ramps/paj-cash");
    expect(findCaseStudy([paj], "off-ramps", "paj-cash")).toBe(paj);
    expect(findCaseStudy([paj], "dexes", "paj-cash")).toBeUndefined();
  });
});

describe("filters", () => {
  const notebooks = [
    paj,
    notebook("stables", { category: "stablecoins", chains: ["Base", "Tron"] }),
  ];
  const cards = buildCategoryCards(notebooks, taxonomy);
  const all = { group: "all" as const, chain: null, search: "" };

  it("gives a category the chains of its notebooks and of the taxonomy", () => {
    expect(cards.find(c => c.slug === "stablecoins")?.chains).toEqual([
      "Base",
      "Ethereum",
      "Tron",
    ]);
  });

  it("offers every chain a category is on, in the configured order", () => {
    expect(chainsPresent(cards, taxonomy)).toEqual([
      "Solana",
      "Base",
      "Ethereum",
      "Tron",
    ]);
  });

  it("narrows by group, chain and search", () => {
    const slugs = (filters: typeof all | object) =>
      filterCards(cards, { ...all, ...filters }).map(c => c.slug);

    expect(slugs({ group: "trading" })).toEqual(["dexes"]);
    expect(slugs({ chain: "Base" })).toEqual(["stablecoins"]);
    expect(slugs({ search: "paj" })).toEqual(["off-ramps"]);
    expect(slugs({ search: "tron" })).toEqual(["stablecoins"]);
    expect(slugs({ search: "nigeria" })).toEqual(["off-ramps"]);
  });

  it("counts categories per group", () => {
    expect(groupCounts(cards)).toEqual({ all: 3, money: 2, trading: 1 });
  });
});

describe("utm", () => {
  it("reads only UTM values off a URL", () => {
    expect(readUtm("?utm_source=x&utm_campaign=paj&page=2")).toEqual({
      utm_source: "x",
      utm_campaign: "paj",
    });
  });

  it("puts UTM values on a share link, keeping what is already there", () => {
    expect(withUtm("/showcase/off-ramps?cell=3", { utm_source: "share" })).toBe(
      "/showcase/off-ramps?cell=3&utm_source=share"
    );
  });
});
