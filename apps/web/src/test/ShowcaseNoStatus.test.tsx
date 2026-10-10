import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { ShowcaseGrid } from "@/components/Showcase/ShowcaseGrid";
import { buildCategoryCards } from "@/lib/showcase";
import type { ShowcaseNotebook, ShowcaseTaxonomy } from "@/types";

const taxonomy = {
  groups: [{ id: "defi", label: "DeFi" }],
  chains: [],
  categories: [
    {
      slug: "stablecoins",
      name: "Stablecoins",
      group: "defi",
      question: "Who moves stablecoins, and where?",
      protocols: ["USDC"],
    },
    {
      slug: "off-ramps",
      name: "Off-ramps",
      group: "defi",
      question: "How does money leave crypto?",
      protocols: ["Paj"],
    },
  ],
} as unknown as ShowcaseTaxonomy;

const notebook = (category: string, kind: string, slug: string) =>
  ({
    slug,
    showcase: { category, kind, protocol: slug, chains: [], country: null },
  }) as unknown as ShowcaseNotebook;

describe("Showcase cards", () => {
  // One category with a case study, one with only a category page: the two the
  // page used to tag "Live" and "Building".
  const cards = buildCategoryCards(
    [
      notebook("off-ramps", "case_study", "paj"),
      notebook("stablecoins", "category", "stablecoins"),
    ],
    taxonomy
  );

  it("shows what has been done, with no Live or Building tag on any card", () => {
    expect(cards.map(c => c.status).sort()).toEqual(["building", "live"]);

    const { container } = render(
      <ShowcaseGrid cards={cards} taxonomy={taxonomy} onRequest={vi.fn()} />
    );

    expect(screen.getByText("Off-ramps")).toBeTruthy();
    expect(screen.getByText("Stablecoins")).toBeTruthy();
    expect(container.textContent ?? "").not.toMatch(/\blive\b|\bbuilding\b/i);
  });
});
