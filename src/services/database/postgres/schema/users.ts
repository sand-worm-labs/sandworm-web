import {
  pgTable,
  varchar,
  timestamp,
  integer,
  jsonb,
  text,
} from "drizzle-orm/pg-core";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(), // use UUID or string ID
  username: varchar("username", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  image: text("image"),
  emailVerified: timestamp("email_verified"),
  stars: integer("stars").default(0).notNull(),
  forks: integer("forks").default(0).notNull(),
  socialLinks: jsonb("social_links"), // SocialLinks object
  status: jsonb("status"), // Status object
  wallets: jsonb("wallets"), // array of Wallet objects
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const SocialLinksSchema = z.object({
  telegram: z.string(),
  twitter: z.string(),
  github: z.string(),
  discord: z.string(),
  email: z.string(),
  instagram: z.string(),
  warpcast: z.string(),
});

export const StatusSchema = z.object({
  text: z.string(),
  timestamp: z.number(),
});

export const WalletSchema = z.object({
  chain: z.string(),
  address: z.string(),
});

export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string(),
  name: z.string().optional(),
  image: z.string().optional(),
  emailVerified: z.date().optional(),
  stars: z.number(),
  forks: z.number(),
  socialLinks: SocialLinksSchema.optional(),
  status: StatusSchema.optional(),
  wallets: z.array(WalletSchema).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
