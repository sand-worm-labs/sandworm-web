import {
  pgTable,
  uuid,
  timestamp,
  text,
  varchar,
  jsonb,
} from "drizzle-orm/pg-core";
import type { AppUsage } from "../types/usage";

import { users as UserTable } from "./user";

export const ChatTable = pgTable("chats", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  title: text("title").notNull(),
  userId: uuid("userId")
    .notNull()
    .references(() => UserTable.id, { onDelete: "cascade" }),
  visibility: varchar("visibility", { enum: ["public", "private"] })
    .notNull()
    .default("private"),
  lastContext: jsonb("lastContext").$type<AppUsage | null>(),
});
