import {
  entityFixtures,
  findEntityPage,
} from "@/features/analysis/entity/fixtures";
import { isEntityKind } from "@/features/analysis/entity/types";
import { overviewFixtures } from "@/features/overview/fixtures";
import type { OrganisationTypeId } from "@/features/setup/options/organisation-types";

import type { AnalysisCatalog } from "../types";

import { exchangeAnalysis } from "./exchange";
import { analysisFromOverview } from "./from-overview";

const catalogs: Record<OrganisationTypeId, AnalysisCatalog> = {
  exchange: exchangeAnalysis,
  nft: analysisFromOverview(overviewFixtures.nft),
  protocol: analysisFromOverview(overviewFixtures.protocol),
  chain: analysisFromOverview(overviewFixtures.chain),
  vc: analysisFromOverview(overviewFixtures.vc),
  accelerator: analysisFromOverview(overviewFixtures.accelerator),
};

function linkEntityPages(
  catalog: AnalysisCatalog,
  clientKind: OrganisationTypeId
): AnalysisCatalog {
  const pages = entityFixtures[clientKind];

  return {
    ...catalog,
    views: catalog.views.map(view => ({
      ...view,
      rows: view.rows.map(row => ({
        ...row,
        hasPage:
          isEntityKind(view.rowRoute) &&
          findEntityPage(pages, view.rowRoute, row.slug) !== undefined,
      })),
    })),
  };
}

export const analysisFixtures = Object.fromEntries(
  Object.entries(catalogs).map(([clientKind, catalog]) => [
    clientKind,
    linkEntityPages(catalog, clientKind as OrganisationTypeId),
  ])
) as Record<OrganisationTypeId, AnalysisCatalog>;
