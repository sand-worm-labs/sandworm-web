import { isEntityKind } from "@/lib/analysis/entity/kinds";
import type { AnalysisCatalog, ClientKind } from "@/types";
import { overviewMockData } from "@/_mockdata/overview";

import { entityFixtures, findEntityPage } from "./entity";
import { exchangeAnalysis } from "./exchange";
import { paycrestAnalysis } from "./paycrest";
import { analysisFromOverview } from "./from-overview";

const catalogs: Record<ClientKind, AnalysisCatalog> = {
  exchange: exchangeAnalysis,
  protocol: analysisFromOverview(overviewMockData.protocol),
  chain: analysisFromOverview(overviewMockData.chain),
  vc: analysisFromOverview(overviewMockData.vc),
  accelerator: analysisFromOverview(overviewMockData.accelerator),
  other: analysisFromOverview(overviewMockData.other),
  paycrest: paycrestAnalysis,
};

// A row is a link only when its entity page exists for that client.
function linkEntityPages(
  catalog: AnalysisCatalog,
  clientKind: ClientKind
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

export const analysisMockData = Object.fromEntries(
  Object.entries(catalogs).map(([clientKind, catalog]) => [
    clientKind,
    linkEntityPages(catalog, clientKind as ClientKind),
  ])
) as Record<ClientKind, AnalysisCatalog>;
