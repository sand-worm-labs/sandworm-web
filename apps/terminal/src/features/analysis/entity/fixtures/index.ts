import type { OrganisationTypeId } from "@/features/setup/options/organisation-types";

import type { EntityKind, EntityPage } from "../types";

import { cashOutPage } from "./cash-out";
import { latinAmericaPage } from "./latin-america";
import { paycrestPage } from "./paycrest";

const exchangePages: readonly EntityPage[] = [
  paycrestPage,
  latinAmericaPage,
  cashOutPage,
];

export const entityFixtures: Record<OrganisationTypeId, readonly EntityPage[]> =
  {
    exchange: exchangePages,
    protocol: [],
    chain: [],
    vc: [],
    accelerator: [],
    other: [],
  };

export function findEntityPage(
  pages: readonly EntityPage[],
  kind: EntityKind,
  slug: string
): EntityPage | undefined {
  return pages.find(page => page.kind === kind && page.slug === slug);
}
