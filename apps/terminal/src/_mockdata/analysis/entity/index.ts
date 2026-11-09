import {
  AnalysisViewKind,
  type AnalysisReport,
  type AnalysisSubject,
} from "@sandworm/types/terminal";

import { toId } from "@/lib/slug";
import type { ClientKind } from "@/types";

import { ago } from "../../ago";

const report = (
  title: string,
  daysAgo: number,
  line = "",
  isNew = false
): AnalysisReport => ({
  id: toId(title),
  title,
  line,
  publishedAt: ago(daysAgo),
  isNew,
  path: `/workspace/preview/documents/${toId(title)}`,
});

const subject = (
  view: AnalysisViewKind,
  name: string,
  kind: string,
  impact: string,
  reports: AnalysisReport[]
): AnalysisSubject => ({
  id: toId(name),
  view,
  name,
  icon: null,
  kind,
  impact,
  impactSize: 0,
  reports,
});

const exchangePages = () => [
  subject(
    AnalysisViewKind.PROJECT,
    "Paycrest",
    "Payments · Africa",
    "2,140 of your users",
    [
      report(
        "Paycrest: who actually cashes out in Africa",
        1,
        "Who uses it, where the money goes and what each route costs.",
        true
      ),
      report(
        "Yellow Card against Paycrest",
        20,
        "Fees, speed and coverage, route by route."
      ),
      report(
        "Stablecoin payouts to Nigeria, Q3",
        40,
        "How much moves, through whom, and how fast it grows."
      ),
    ]
  ),
  subject(
    AnalysisViewKind.REGION,
    "Latin America",
    "Argentina, Brazil, Mexico",
    "41,800 wallets",
    [
      report("Argentina's off-ramps, ranked by fees", 0),
      report("LatAm cash-out sizing", 14),
      report("Bitso and Mexico's cash-out routes", 15),
      report("Pix and stablecoins: how Brazil buys in", 25),
      report("Who holds pesos onchain", 36),
    ]
  ),
  subject(
    AnalysisViewKind.SECTOR,
    "Cash-out and off-ramps",
    "Turning stablecoins into local money",
    "27,400 wallets",
    [
      report("Argentina's off-ramps, ranked by fees", 0),
      report("Paycrest: who actually cashes out in Africa", 1),
      report("LatAm cash-out sizing", 14),
      report("Bitso and Mexico's cash-out routes", 15),
      report("Yellow Card against Paycrest", 20),
    ]
  ),
];

// The collections that have a page for each client, built when asked for so
// their dates are relative to now
export const entityFixtures = (clientKind: ClientKind) =>
  clientKind === "exchange" || clientKind === "paycrest" ? exchangePages() : [];

export const findEntity = (subjects: readonly AnalysisSubject[], id: string) =>
  subjects.find(item => item.id === id);
