import {
  pgTable,
  uuid,
  timestamp,
  text,
  varchar,
  jsonb,
} from "drizzle-orm/pg-core";
import type { AppUsage } from "../types/usage";

import { users } from "./user";

export const ChatTable = pgTable("chats", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  title: text("title").notNull(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  visibility: varchar("visibility", { enum: ["public", "private"] })
    .notNull()
    .default("private"),
  lastContext: jsonb("lastContext").$type<AppUsage | null>(),
});
