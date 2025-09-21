import { pgTable, varchar, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { z } from "zod";

export const VerificationTokenTable = pgTable(
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

// Zod schema for verification_tokens
export const verificationTokenSchema = z.object({
  identifier: z.string().max(255),
  token: z.string().max(255),
  expires: z.date(),
});

// TypeScript type inferred from Zod
export type VerificationTokens = z.infer<typeof verificationTokenSchema>;
