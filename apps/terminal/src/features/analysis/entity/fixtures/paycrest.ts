import type { EntityPage } from "../types";

import {
  badge,
  barRow,
  change,
  columnBar,
  kpi,
  reportLink,
  tableRow,
  text,
} from "./builders";

export const paycrestPage: EntityPage = {
  slug: "paycrest",
  kind: "project",
  name: "Paycrest",
  tags: ["Payments", "Africa"],
  summary:
    "Stablecoin payouts to Nigeria, Kenya and Ghana. 3 reports, last updated Mon 2 Nov.",
  kpis: [
    kpi(
      "Monthly payout volume",
      "$38.6M",
      { text: "▲ 14%", tone: "positive" },
      "vs September"
    ),
    kpi(
      "Active senders",
      "19,400",
      { text: "▲ 9%", tone: "positive" },
      "vs September"
    ),
    kpi("Average fee", "0.9%", { text: "Flat", tone: "neutral" }, "since July"),
    kpi(
      "Your users on Paycrest",
      "2,140",
      { text: "▲ 18%", tone: "positive" },
      "vs September"
    ),
  ],
  insight: {
    heading: "2,140 of your users sent $5.1M through Paycrest in October",
    text: "They move stablecoins out of Acme Wallet first, then send them home. Up 18% on September.",
    action: { label: "See the opportunity", route: "opportunity" },
  },
  rows: [
    {
      id: "volume-and-destinations",
      split: "wide-narrow",
      blocks: [
        {
          _tag: "columnChart",
          id: "volume",
          title: "Monthly payout volume",
          subtitle: "Up 75% since May",
          bars: [
            columnBar("May", 22.1, "$22.1M"),
            columnBar("Jun", 25.4, "$25.4M"),
            columnBar("Jul", 28, "$28.0M"),
            columnBar("Aug", 31.2, "$31.2M"),
            columnBar("Sep", 33.9, "$33.9M"),
            columnBar("Oct", 38.6, "$38.6M"),
          ],
        },
        {
          _tag: "barList",
          id: "destinations",
          title: "Where your users send money",
          subtitle: "Share of the $5.1M your users sent in October",
          labelWidth: 76,
          valueWidth: 44,
          rows: [
            barRow("Nigeria", 58, "58%", "navy", true),
            barRow("Kenya", 24, "24%", "navy"),
            barRow("Ghana", 12, "12%", "navy"),
            barRow("Others", 6, "6%", "muted"),
          ],
        },
      ],
    },
    {
      id: "routes",
      split: "full",
      blocks: [
        {
          _tag: "dataTable",
          id: "routes-table",
          title: "Routes and what they cost",
          subtitle: "All Paycrest payouts in October",
          columns: [
            { id: "route", label: "Route", align: "left" },
            { id: "volume", label: "Monthly volume", align: "right" },
            { id: "fee", label: "Average fee", align: "right" },
            { id: "time", label: "Typical payout time", align: "right" },
            { id: "change", label: "Change vs Sept", align: "right" },
          ],
          rows: [
            tableRow(
              [
                text("Nigeria, naira", true),
                text("$22.4M"),
                text("0.8%"),
                text("3 min"),
                change("▲ 16%"),
              ],
              "Nigeria, naira"
            ),
            tableRow(
              [
                text("Kenya, shilling", true),
                text("$9.3M"),
                text("1.1%"),
                text("4 min"),
                change("▲ 12%"),
              ],
              "Kenya, shilling"
            ),
            tableRow(
              [
                text("Ghana, cedi", true),
                text("$4.6M"),
                text("1.3%"),
                text("6 min"),
                change("▲ 9%"),
              ],
              "Ghana, cedi"
            ),
            tableRow(
              [
                text("Other routes", true),
                text("$2.3M"),
                text("1.6%"),
                text("9 min"),
                badge("▼ 2%", "negative"),
              ],
              "Other routes"
            ),
          ],
        },
      ],
    },
    {
      id: "reports",
      split: "full",
      blocks: [
        {
          _tag: "reportList",
          id: "reports-list",
          title: "Reports on Paycrest",
          items: [
            reportLink({
              title: "Paycrest: who actually cashes out in Africa",
              line: "Who uses it, where the money goes and what each route costs.",
              when: "Mon 2 Nov",
              isNew: true,
            }),
            reportLink({
              title: "Yellow Card against Paycrest",
              line: "Fees, speed and coverage, route by route.",
              when: "20 Oct",
            }),
            reportLink({
              title: "Stablecoin payouts to Nigeria, Q3",
              line: "How much moves, through whom, and how fast it grows.",
              when: "30 Sep",
            }),
          ],
        },
      ],
    },
  ],
};
