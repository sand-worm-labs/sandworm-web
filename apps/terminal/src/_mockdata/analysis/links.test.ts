import { AnalysisViewKind, OrganisationTypeId } from "@sandworm/types/terminal";
import { describe, expect, it } from "vitest";

import type { ClientKind } from "@/types";

import { entityFixtures } from "./entity";

import { analysisMockData } from "./index";

const linked = (clientKind: keyof typeof analysisMockData) =>
  analysisMockData[clientKind].views.flatMap(view =>
    view.rows.filter(row => row.hasPage).map(row => row.id)
  );

describe("analysis rows link to entity pages", () => {
  it("links a project, a region and a sector for the exchange client", () => {
    const links = linked(OrganisationTypeId.EXCHANGE);

    const subjects = entityFixtures(OrganisationTypeId.EXCHANGE);

    expect(links).toContain("paycrest");
    Object.values(AnalysisViewKind).forEach(view => {
      expect(
        subjects.some(
          subject => subject.view === view && links.includes(subject.id)
        )
      ).toBe(true);
    });
  });

  it("links exactly the rows that have a page, for every client", () => {
    Object.entries(analysisMockData).forEach(([clientKind, catalog]) => {
      const pages = entityFixtures(clientKind as ClientKind);
      const expected = catalog.views.flatMap(view =>
        view.rows.filter(row => pages.some(page => page.id === row.id))
      );

      expect(
        catalog.views.flatMap(view => view.rows).filter(row => row.hasPage)
      ).toEqual(expected);
    });
  });

  it("links nothing for a client with no entity pages", () => {
    expect(linked(OrganisationTypeId.PROTOCOL)).toEqual([]);
  });
});
