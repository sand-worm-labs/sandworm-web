import {
  pgTable,
  varchar,
  text,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";

import { z } from "zod";

// Account table
export const accounts = pgTable(
  "accounts",
  {
    userId: varchar("user_id", { length: 255 }).notNull(),
    type: varchar("type", { length: 255 }).notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
    refreshToken: text("refresh_token"),
    accessToken: text("access_token"),
    expiresAt: integer("expires_at"), // Unix timestamp
    tokenType: varchar("token_type", { length: 255 }),
    scope: text("scope"),
    idToken: text("id_token"),
    sessionState: text("session_state"),
  },
  table => ({
    pk: primaryKey(table.provider, table.providerAccountId),
  })
);


export const accountSchema = z.object({
  userId: z.string().max(255),
  type: z.string().max(255),
  provider: z.string().max(255),
  providerAccountId: z.string().max(255),
  refreshToken: z.string().nullable().optional(),
  accessToken: z.string().nullable().optional(),
  expiresAt: z.number().int().nullable().optional(), // Unix timestamp
  tokenType: z.string().max(255).nullable().optional(),
  scope: z.string().nullable().optional(),
  idToken: z.string().nullable().optional(),
  sessionState: z.string().nullable().optional(),
});

export type Account = z.infer<typeof accountSchema>;
