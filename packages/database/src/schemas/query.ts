import {
  pgTable,
  text,
  jsonb,
  boolean,
  timestamp,
  uuid,
  foreignKey,
} from "drizzle-orm/pg-core";
import { z } from "zod";
import { relations } from "drizzle-orm";

import { UserTable } from "./user";

export const QueryTable = pgTable(
  "queries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    creator_id: uuid("creator_id"),
    private: boolean("private").notNull().default(false),
    query: text("query").notNull(),
    tags: jsonb("tags").notNull().default([]),
    forked_from_id: uuid("forked_from"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  table => [
    foreignKey({
      columns: [table.forked_from_id],
      foreignColumns: [table.id],
      name: "forked_from",
    }),
  ]
);

export const usersRelations = relations(QueryTable, ({ one, many }) => ({
  creator: one(UserTable, {
    fields: [QueryTable.creator_id],
    references: [UserTable.id],
  }),
  stared_by: many(UserTable),
  forked_by: many(UserTable),
}));

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
