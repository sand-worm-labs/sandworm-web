import { pgTable, varchar, text, integer } from "drizzle-orm/pg-core";
import { z } from "zod";

export const accounts = pgTable("Account", {
  userId: varchar("user_id", { length: 255 }).notNull(),
  type: varchar("type", { length: 255 }).notNull(),
  provider: varchar("provider", { length: 255 }).notNull(),
  providerAccountId: varchar("provider_account_id", {
    length: 255,
  }).notNull(),
  refreshToken: text("refresh_token"),
  accessToken: text("access_token"),
  expiresAt: integer("expires_at"),
  tokenType: varchar("token_type", { length: 255 }),
  scope: text("scope"),
  idToken: text("id_token"),
  sessionState: text("session_state"),
});

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
