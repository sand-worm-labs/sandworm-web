import {
  pgTable,
  varchar,
  text,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";

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
