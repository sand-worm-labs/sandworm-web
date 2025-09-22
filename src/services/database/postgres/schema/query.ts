import {
  pgTable,
  text,
  jsonb,
  integer,
  boolean,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { z } from "zod";
import { sql } from "drizzle-orm";

import { UserTable } from "./user";

export const QueryTable = pgTable("Query", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  creator: uuid("creator").notNull(), // foreign key to user.id
  private: boolean("private").notNull().default(false),
  query: text("query").notNull(),
  tags: jsonb("tags").notNull().default([]),
  stared_by: jsonb("stared_by")
    .notNull()
    .default(sql`'[]'::jsonb`),
  forked_from: uuid("forked_from").references(() => UserTable.id), // nullable, no fake default
  forked_by: jsonb("forked_by")
    .notNull()
    .default(sql`'[]'::jsonb`),
  forked: boolean("forked").notNull().default(false),
  stars: integer("stars").notNull().default(0),
  forks: integer("forks").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
// Zod schema for typing
export const QueryType = z.object({
  title: z.string(),
  description: z.string(),
  creator: z.string(),
  private: z.boolean(),
  query: z.string(),
  tags: z.array(z.string()),
  stars: z.number(),
  forks: z.number(),
  stared_by: z.array(z.string()),
  forked_from: z.string().nullable(),
  forked_by: z.array(z.string()),
  forked: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Query = z.infer<typeof QueryType>;
