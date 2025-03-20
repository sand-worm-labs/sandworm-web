export type Blockchain = {
  id: string;
  name: string;
};

export type TableType = "transactions" | "blocks" | "accounts";

export interface TableField {
  name: string;
  type: "number" | "string" | "timestamp" | "boolean";
  sortable?: boolean; // Can be sorted?
  filterable?: boolean;
}

export interface ExplorerTable {
  id: string;
  name: string;
  fields: TableField[];
}

export interface DataExplorer {
  chain: Blockchain;
  entities: ExplorerTable[];
}
export const explorerMockData: DataExplorer[] = [
  {
    chain: { id: "sol", name: "Solana" },
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
    chain: { id: "sui", name: "Sui" },
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
