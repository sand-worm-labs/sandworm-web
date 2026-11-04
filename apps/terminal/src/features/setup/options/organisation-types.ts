import type { OrganisationTypeId } from "@sandworm/types/terminal";

export type { OrganisationTypeId } from "@sandworm/types/terminal";

export type TemplateBlock = { title: string; summary: string };

export type TemplateBlueprint = {
  name: string;
  kpis: readonly string[];
  blocks: readonly TemplateBlock[];
};

type OrganisationTypeDefinition = {
  id: OrganisationTypeId;
  label: string;
  description: string;
  template: TemplateBlueprint;
};

export const ORGANISATION_TYPES = [
  {
    id: "exchange",
    label: "Trading app or wallet",
    description: "Your users, their wallets and where they go",
    template: {
      name: "Trading app",
      kpis: [
        "Swap volume",
        "Active wallets",
        "New wallets",
        "Still trading after 90 days",
      ],
      blocks: [
        {
          title: "Who carries your volume",
          summary: "How much depends on a few wallets",
        },
        {
          title: "Where users go when they leave",
          summary: "The apps they use next",
        },
        { title: "Gaps", summary: "Things your users do somewhere else" },
      ],
    },
  },
  {
    id: "protocol",
    label: "DeFi protocol",
    description: "Deposits, borrowers and competing protocols",
    template: {
      name: "DeFi protocol",
      kpis: ["Deposits", "Fees, 30 days", "Revenue, 30 days", "Active users"],
      blocks: [
        {
          title: "Who carries your deposits",
          summary: "Concentration in your largest wallets",
        },
        {
          title: "Where withdrawn funds go",
          summary: "The protocols they move to",
        },
        { title: "Gaps", summary: "Things your users do somewhere else" },
      ],
    },
  },
  {
    id: "chain",
    label: "Blockchain or L2",
    description: "Apps, developers and bridges on your chain",
    template: {
      name: "Blockchain",
      kpis: [
        "Daily active addresses",
        "Fees, 30 days",
        "Stablecoin supply",
        "Active developers",
      ],
      blocks: [
        {
          title: "Who carries your activity",
          summary: "The apps that make most transactions",
        },
        {
          title: "Where users bridge out to",
          summary: "Value leaving, by chain",
        },
        { title: "Gaps", summary: "Things your users do on other chains" },
      ],
    },
  },
  {
    id: "vc",
    label: "Investor or fund",
    description: "Your portfolio, its rivals and deals you might miss",
    template: {
      name: "Investor",
      kpis: [
        "Portfolio users",
        "Portfolio fees",
        "Projects growing",
        "Red flags",
      ],
      blocks: [
        {
          title: "Which holdings carry the portfolio",
          summary: "Where your users really are",
        },
        {
          title: "Competitors gaining on your holdings",
          summary: "Market share moves",
        },
        { title: "Gaps", summary: "Sectors growing where you hold nothing" },
      ],
    },
  },
  {
    id: "accelerator",
    label: "Accelerator",
    description: "Every company in your batches, side by side",
    template: {
      name: "Accelerator",
      kpis: [
        "Companies live onchain",
        "Combined users",
        "Median weekly growth",
        "Breakouts",
      ],
      blocks: [
        {
          title: "Which companies drive the batch",
          summary: "Where the traction is",
        },
        {
          title: "Your batches against others",
          summary: "Weekly growth after launch",
        },
        { title: "Gaps", summary: "Sectors with no company in your batches" },
      ],
    },
  },
  {
    id: "other",
    label: "Something else",
    description: "Tell us what you do and we'll shape the layout with you",
    template: {
      name: "General",
      kpis: [
        "Active users",
        "New users",
        "Transactions",
        "Still active after 90 days",
      ],
      blocks: [
        {
          title: "Who carries your activity",
          summary: "How much depends on a few wallets",
        },
        {
          title: "Where users go next",
          summary: "The apps and chains they move to",
        },
        { title: "Gaps", summary: "Things your users do somewhere else" },
      ],
    },
  },
] as const satisfies readonly OrganisationTypeDefinition[];

export function getOrganisationType(id: OrganisationTypeId) {
  return (
    ORGANISATION_TYPES.find(type => type.id === id) ?? ORGANISATION_TYPES[0]
  );
}
