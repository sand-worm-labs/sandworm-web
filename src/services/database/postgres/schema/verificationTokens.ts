import { pgTable, varchar, timestamp, primaryKey } from "drizzle-orm/pg-core";

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  table => ({
    pk: primaryKey(table.identifier, table.token),
  })
);
