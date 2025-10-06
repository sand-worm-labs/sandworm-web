import {
  pgTable,
  text,
  jsonb,
  boolean,
  timestamp,
  uuid,
  foreignKey,
} from "drizzle-orm/pg-core";

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
