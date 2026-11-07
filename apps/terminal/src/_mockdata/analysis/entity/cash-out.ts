import type { EntityPage } from "@/lib/analysis/entity/types";

import {
  badge,
  change,
  entity,
  kpi,
  signalLink,
  reportLink,
  tableRow,
  text,
} from "./builders";

export const cashOutPage: EntityPage = {
  slug: "cash-out-and-off-ramps",
  kind: "sector",
  name: "Cash-out and off-ramps",
  tags: ["Sector"],
  summary:
    "Turning stablecoins into local money. 7 reports, last updated today.",
  kpis: [
    kpi(
      "Your users who cash out",
      "27,400",
      { text: "▲ 7%", tone: "positive" },
      "vs September"
    ),
    kpi(
      "Cashed out in October",
      "$31.6M",
      { text: "▲ 11%", tone: "positive" },
      "vs September"
    ),
    kpi("Average fee they pay", "1.7%", {
      text: "Lowest route: 0.8%",
      tone: "neutral",
    }),
    kpi("Cash out outside your app", "92%", {
      text: "of that money",
      tone: "neutral",
    }),
  ],
  insight: {
    heading: "Your users pay about $537K a month to cash out somewhere else",
    text: "$31.6M left your app through other ramps in October, at 1.7% on average.",
    action: { label: "See 2 signals", route: "signals" },
  },
  rows: [
    {
      id: "ramps",
      split: "full",
      blocks: [
        {
          _tag: "dataTable",
          id: "ramps-table",
          title: "Ramps your users cash out with",
          subtitle: "Ranked by how much your users cashed out in October",
          columns: [
            { id: "rank", label: "#", align: "left" },
            { id: "ramp", label: "Ramp", align: "left" },
            { id: "countries", label: "Countries", align: "left" },
            { id: "users", label: "Your users", align: "right" },
            { id: "cashed-out", label: "Cashed out", align: "right" },
            { id: "fee", label: "Average fee", align: "right" },
            { id: "change", label: "Users vs Sept", align: "right" },
          ],
          rows: [
            tableRow(
              [
                text("1"),
                entity("Lemon"),
                text("Argentina"),
                text("6,300"),
                text("$8.1M"),
                badge("2.4%", "brand"),
                change("▲ 12%"),
              ],
              "Lemon"
            ),
            tableRow(
              [
                text("2"),
                entity("Paycrest"),
                text("Nigeria, Kenya, Ghana"),
                text("2,140"),
                text("$5.1M"),
                text("0.9%"),
                change("▲ 18%"),
              ],
              "Paycrest"
            ),
            tableRow(
              [
                text("3"),
                entity("Bitso"),
                text("Mexico"),
                text("2,700"),
                text("$4.2M"),
                text("1.1%"),
                change("▼ 3%"),
              ],
              "Bitso"
            ),
            tableRow(
              [
                text("4"),
                entity("Ripio"),
                text("Argentina, Brazil"),
                text("3,100"),
                text("$3.9M"),
                badge("2.0%", "brand"),
                change("▲ 6%"),
              ],
              "Ripio"
            ),
            tableRow(
              [
                text("5"),
                entity("Coins.ph"),
                text("Philippines"),
                text("1,900"),
                text("$2.6M"),
                text("1.6%"),
                change("▲ 4%"),
              ],
              "Coins.ph"
            ),
            tableRow(
              [
                text("6"),
                entity("Yellow Card"),
                text("Africa, 6 countries"),
                text("640"),
                text("$1.2M"),
                text("1.3%"),
                change("▲ 9%"),
              ],
              "Yellow Card"
            ),
            tableRow(
              [
                text("7"),
                entity("Others"),
                text("14 ramps"),
                text("10,620"),
                text("$6.5M"),
                text("1.8%"),
                change("▲ 2%"),
              ],
              "Others"
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
          title: "Reports in this sector",
          items: [
            reportLink({
              title: "Argentina's off-ramps, ranked by fees",
              when: "Today",
            }),
            reportLink({
              title: "Paycrest: who actually cashes out in Africa",
              when: "Mon 2 Nov",
            }),
            reportLink({ title: "LatAm cash-out sizing", when: "Mon 26 Oct" }),
            reportLink({
              title: "Bitso and Mexico's cash-out routes",
              when: "26 Oct",
            }),
            reportLink({
              title: "Yellow Card against Paycrest",
              when: "20 Oct",
            }),
          ],
        },
        {
          _tag: "signalList",
          id: "signals-list",
          title: "Signals in this sector",
          items: [
            signalLink({
              title: "Argentina's off-ramps charge 2× Nigeria's fees",
              status: "New",
              confidence: "High",
              value: "$43K/mo",
            }),
            signalLink({
              title: "Let users send money home with Paycrest",
              status: "New",
              confidence: "Medium",
              value: "$5.1M/mo",
            }),
          ],
        },
      ],
    },
  ],
};
