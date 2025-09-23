import { pgTable, text, integer, primaryKey, uuid } from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "@auth/core/adapters";
import { z } from "zod";

import { UserTable } from "./user";

export const AccountTable = pgTable(
  "accounts",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => UserTable.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  account => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ]
);

export const accountSchema = z.object({
  userId: z.string().max(255),
  type: z.string().max(255),
  provider: z.string().max(255),
  providerAccountId: z.string().max(255),
  refreshToken: z.string().nullable().optional(),
  accessToken: z.string().nullable().optional(),
  expiresAt: z.number().nullable().optional(),
  tokenType: z.string().max(255).nullable().optional(),
  scope: z.string().nullable().optional(),
  idToken: z.string().nullable().optional(),
  sessionState: z.string().nullable().optional(),
});

export type Account = z.infer<typeof accountSchema>;
