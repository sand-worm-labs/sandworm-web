import type { Query } from "@/types";

export const queries: Query[] = [
  {
    id: "query_12345",
    name: "Top 10 Sui Tokens",
    description: "Fetches the top 10 token holders for a given token",
    query:
      "SELECT * FROM holders WHERE token = $TOKEN ORDER BY balance DESC LIMIT 10;",
    author: {
      id: "user_67890",
      username: "blockchain_analyst",
    },
    createdAt: "2025-02-25T12:34:56Z",
    updatedAt: "2025-02-25T12:35:56Z",
    visibility: "public",
    tags: ["token", "holders", "analytics"],
    parameters: [
      {
        name: "TOKEN",
        type: "string",
        description: "The token address to fetch holders for",
        required: true,
      },
    ],
    saves: 120,
  },
  {
    id: "query_67890",
    name: "Most Active Wallets",
    description: "Finds wallets with the highest transaction count",
    query:
      "SELECT * FROM transactions GROUP BY wallet ORDER BY COUNT(*) DESC LIMIT 10;",
    author: {
      id: "user_12345",
      username: "crypto_whiz",
    },
    createdAt: "2025-02-20T11:00:00Z",
    updatedAt: "2025-02-22T10:15:30Z",
    visibility: "public",
    tags: ["wallets", "transactions", "analytics"],
    parameters: [],
    saves: 85,
  },
  {
    id: "query_67891",
    name: "Most Active Sui Wallets",
    description: "Finds wallets with the highest transaction count",
    query:
      "SELECT * FROM transactions GROUP BY wallet ORDER BY COUNT(*) DESC LIMIT 10;",
    author: {
      id: "user_12345",
      username: "crypto_whiz",
    },
    createdAt: "2025-02-20T11:00:00Z",
    updatedAt: "2025-02-22T10:15:30Z",
    visibility: "public",
    tags: ["wallets", "transactions", "analytics"],
    parameters: [],
    saves: 85,
  },
  {
    id: "query_67894",
    name: "Most Active Wallets",
    description: "Finds wallets with the highest transaction count",
    query:
      "SELECT * FROM transactions GROUP BY wallet ORDER BY COUNT(*) DESC LIMIT 10;",
    author: {
      id: "user_12345",
      username: "crypto_whiz",
    },
    createdAt: "2025-02-20T11:00:00Z",
    updatedAt: "2025-02-22T10:15:30Z",
    visibility: "public",
    tags: ["wallets", "transactions", "analytics"],
    parameters: [],
    saves: 85,
  },
];
