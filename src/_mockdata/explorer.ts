export type Chain = {
  id: string;
  name: string;
  shortCode: string;
  logo?: string;
};

export type TableType = "transactions" | "blocks" | "accounts";

export interface TableField {
  name: string;
  type: "number" | "string" | "timestamp" | "boolean";
  sortable?: boolean;
  filterable?: boolean;
}

export interface ExplorerTable {
  id: string;
  name: string;
  fields: TableField[];
}

export interface DataExplorers {
  chainId: string;
  entities: ExplorerTable[];
}

export const chains: Chain[] = [
  { id: "sol", name: "Solana", shortCode: "SOL", logo: "/logos/solana.png" },
  { id: "sui", name: "Sui", shortCode: "SUI", logo: "/logos/sui.png" },
];

export const explorerMockData: DataExplorers[] = [
  {
    chainId: "sol",
    entities: [
      {
        id: "sol.transactions",
        name: "Transactions",
        fields: [
          { name: "Transaction ID", type: "string" },
          { name: "Block Time", type: "timestamp", sortable: true },
          { name: "Fee", type: "number", sortable: true },
          { name: "Status", type: "string", filterable: true },
          { name: "Type", type: "string" },
        ],
      },
      {
        id: "sol.blocks",
        name: "Blocks",
        fields: [
          { name: "Block Height", type: "number", sortable: true },
          { name: "Timestamp", type: "timestamp", sortable: true },
          { name: "Transaction Count", type: "number" },
        ],
      },
    ],
  },
  {
    chainId: "sui",
    entities: [
      {
        id: "sui.transactions",
        name: "Transactions",
        fields: [
          { name: "Transaction ID", type: "string" },
          { name: "Block Time", type: "timestamp", sortable: true },
          { name: "Gas Fee", type: "number", sortable: true },
          { name: "Status", type: "string", filterable: true },
        ],
      },
    ],
  },
];
