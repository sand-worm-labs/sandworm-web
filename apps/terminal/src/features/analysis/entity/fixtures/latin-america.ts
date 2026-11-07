import type { EntityPage } from "../types";

import {
  badge,
  change,
  kpi,
  signalLink,
  reportLink,
  tableRow,
  text,
} from "./builders";

export const latinAmericaPage: EntityPage = {
  slug: "latin-america",
  kind: "region",
  name: "Latin America",
  tags: ["Region"],
  summary: "Argentina, Brazil and Mexico. 7 reports, last updated today.",
  kpis: [
    kpi(
      "Your wallets in the region",
      "41,800",
      { text: "▲ 6%", tone: "positive" },
      "vs September"
    ),
    kpi(
      "Cashed out in October",
      "$31.6M",
      { text: "▲ 11%", tone: "positive" },
      "vs September"
    ),
    kpi("Average fee to cash out", "1.6%", {
      text: "Nigeria: 0.9%",
      tone: "neutral",
    }),
    kpi("Signals here", "2", { text: "1 new", tone: "neutral" }),
  ],
  insight: {
    heading: "Your users in Argentina pay the most in the region to cash out",
    text: "11,200 wallets cash out about $14.2M a month at 2.2%. Brazil pays 1.4% and Mexico 1.1%.",
    action: { label: "See the signal", route: "signal" },
  },
  rows: [
    {
      id: "countries",
      split: "full",
      blocks: [
        {
          _tag: "dataTable",
          id: "countries-table",
          title: "Your users by country",
          subtitle: "October",
          columns: [
            { id: "country", label: "Country", align: "left" },
            { id: "wallets", label: "Your wallets", align: "right" },
            { id: "cashed-out", label: "Cashed out", align: "right" },
            { id: "fee", label: "Average fee", align: "right" },
            { id: "route", label: "Most used route", align: "left" },
            { id: "change", label: "Wallets vs Sept", align: "right" },
          ],
          rows: [
            tableRow(
              [
                text("Argentina", true),
                text("11,200"),
                text("$14.2M"),
                badge("2.2%", "brand"),
                text("Peso ramps (3 apps)"),
                change("▲ 9%"),
              ],
              "Argentina"
            ),
            tableRow(
              [
                text("Brazil", true),
                text("19,600"),
                text("$11.9M"),
                text("1.4%"),
                text("Pix ramps"),
                change("▲ 4%"),
              ],
              "Brazil"
            ),
            tableRow(
              [
                text("Mexico", true),
                text("11,000"),
                text("$5.5M"),
                text("1.1%"),
                text("SPEI ramps"),
                change("▼ 2%"),
              ],
              "Mexico"
            ),
          ],
        },
      ],
    },
    {
      id: "reports-and-signals",
      split: "wide-narrow",
      blocks: [
        {
          _tag: "reportList",
          id: "reports-list",
          title: "Reports on Latin America",
          items: [
            reportLink({
              title: "Argentina's off-ramps, ranked by fees",
              when: "Today",
            }),
            reportLink({ title: "LatAm cash-out sizing", when: "Mon 26 Oct" }),
            reportLink({
              title: "Bitso and Mexico's cash-out routes",
              when: "26 Oct",
            }),
            reportLink({
              title: "Pix and stablecoins: how Brazil buys in",
              when: "16 Oct",
            }),
            reportLink({ title: "Who holds pesos onchain", when: "5 Oct" }),
          ],
        },
        {
          _tag: "signalList",
          id: "signals-list",
          title: "Signals here",
          items: [
            signalLink({
              title: "Argentina's off-ramps charge 2× Nigeria's fees",
              status: "New",
              confidence: "High",
              value: "$43K/mo",
            }),
            signalLink({
              title: "Let Brazilian users buy with Pix",
              status: "Reviewing",
              confidence: "Medium",
              value: "$18K/mo",
            }),
          ],
        },
      ],
    },
  ],
};
