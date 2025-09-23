import {
  pgTable,
  varchar,
  timestamp,
  jsonb,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import { z } from "zod";
import { sql } from "drizzle-orm";

export const SocialLinksType = z.object({
  telegram: z.string().optional(),
  twitter: z.string().optional(),
  github: z.string().optional(),
  discord: z.string().optional(),
  email: z.string().optional(),
  instagram: z.string().optional(),
  warpcast: z.string().optional(),
});

export const StatusType = z.object({
  text: z.string(),
  timestamp: z.date(),
});

export const WalletType = z.object({
  chain: z.string(),
  address: z.string(),
});

export const UserType = z.object({
  id: z.string().uuid(),
  username: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  image: z.string().nullable().optional(),
  emailVerified: z.date().nullable().optional(),
  stars: z.number(),
  forks: z.number(),
  socialLinks: SocialLinksType.optional(),
  status: StatusType.optional(),
  wallets: z.array(WalletType).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

type SocialLinks = z.infer<typeof SocialLinksType>;
type Status = z.infer<typeof StatusType>;
type Wallet = z.infer<typeof WalletType>[];

export const UserTable = pgTable("users", {
  id: uuid("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  image: text("image"),
  emailVerified: timestamp("email_verified"),
  socialLinks: jsonb("social_links")
    .$type<SocialLinks>()
    .notNull()
    .default(sql`'{}'::jsonb`),
  status: jsonb("status")
    .$type<Status>()
    .notNull()
    .default(
      sql`jsonb_build_object('text', 'Just joined 🚀', 'timestamp', now())`
    ),
  wallets: jsonb("wallets")
    .$type<Wallet>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = z.infer<typeof UserType>;
