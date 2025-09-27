import { pgTable, varchar, timestamp, uuid, text } from "drizzle-orm/pg-core";
import { z } from "zod";

import { UserTable } from "./user";

export const DocumentTable = pgTable("documents", {
  id: uuid("id").notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  title: text("title").notNull(),
  content: text("content"),
  kind: varchar("text", { enum: ["text", "code", "image", "sheet"] })
    .notNull()
    .default("text"),
  userId: uuid("userId")
    .notNull()
    .references(() => UserTable.id, { onDelete: "cascade" }),
});

// ============== Document Schema Type ==============
