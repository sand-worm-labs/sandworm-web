import { pgTable, timestamp, jsonb, text, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { timestamps, timestamptz } from "../utils/helpers";

export const users = pgTable("users", {
  id: text("id").primaryKey().notNull(),
  username: text("username").unique(),
  email: text("email"),
  avatar: text("avatar"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  fullName: text("full_name"),
  avater: text("avater"),
  isOnboarded: boolean("is_onboarded").default(false),
  emailVerifiedAt: timestamptz("email_verified_at"),
  emailVerified: timestamp("email_verified"),

  ...timestamps,
});

export type NewUser = typeof users.$inferInsert;
export type UserItem = typeof users.$inferSelect;

// --- User Settings table ---
export const userSettings = pgTable("user_settings", {
  id: text("id")
    .references(() => users.id, { onDelete: "cascade" })
    .primaryKey(),
  // settings
  socialLinks: jsonb("social_links")
    .$type<{
      telegram?: string;
      twitter?: string;
      github?: string;
      discord?: string;
      email?: string;
      instagram?: string;
      warpcast?: string;
    }>()
    .notNull()
    .default(sql`'{}'::jsonb`),

  statusText: text("status_text").notNull().default("Just joined 🚀"),
  statusUpdatedAt: timestamp("status_updated_at").defaultNow().notNull(),

  wallets: jsonb("wallets")
    .$type<{ chain: string; address: string }[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
});

export type UserSettingsItem = typeof userSettings.$inferSelect;
