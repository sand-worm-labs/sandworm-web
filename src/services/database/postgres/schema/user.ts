import {
  pgTable,
  varchar,
  timestamp,
  integer,
  jsonb,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import { z } from "zod";

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

export const UserTable = pgTable("User", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: varchar("username", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  image: text("image"),
  emailVerified: timestamp("email_verified"),
  stars: integer("stars").default(0).notNull(),
  forks: integer("forks").default(0).notNull(),
  socialLinks: jsonb("social_links").$type<SocialLinks>().default({}),
  status: jsonb("status")
    .$type<Status>()
    .default({ text: "Just joined 🚀", timestamp: new Date() }),
  wallets: jsonb("wallets").$type<Wallet>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = z.infer<typeof UserType>;
