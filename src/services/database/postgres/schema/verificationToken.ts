import { pgTable, text, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { z } from "zod";

export const verificationTokenTable = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  verificationToken => [
    {
      compositePk: primaryKey({
        columns: [verificationToken.identifier, verificationToken.token],
      }),
    },
  ]
);

export const verificationTokenSchema = z.object({
  identifier: z.string().max(255),
  token: z.string().max(255),
  expires: z.date(),
});

// TypeScript type inferred from Zod
export type VerificationTokens = z.infer<typeof verificationTokenSchema>;
