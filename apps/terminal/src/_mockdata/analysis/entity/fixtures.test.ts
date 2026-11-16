import { OrganisationTypeId } from "@sandworm/types/terminal";
import { describe, expect, it } from "vitest";

import { entityFixtures, findEntity } from "./index";

describe("entity fixtures", () => {
  it("finds a collection by its id", () => {
    const subjects = entityFixtures(OrganisationTypeId.EXCHANGE);

    expect(findEntity(subjects, "paycrest")?.name).toBe("Paycrest");
    expect(findEntity(subjects, "nowhere")).toBeUndefined();
  });

  it("gives every collection some reports", () => {
    entityFixtures(OrganisationTypeId.EXCHANGE).forEach(subject => {
      expect(subject.reports.length).toBeGreaterThan(0);
    });
  });
});
