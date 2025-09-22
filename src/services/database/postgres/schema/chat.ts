import {
  pgTable,
  uuid,
  timestamp,
  text,
  varchar,
  jsonb,
} from "drizzle-orm/pg-core";
import { z } from "zod";

import type { AppUsage } from "@/services/usage";

import { UserTable } from "./user";

export const ChatTable = pgTable("chats", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  title: text("title").notNull(),
  userId: uuid("userId")
    .notNull()
    .references(() => UserTable.id),
  visibility: varchar("visibility", { enum: ["public", "private"] })
    .notNull()
    .default("private"),
  lastContext: jsonb("lastContext").$type<AppUsage | null>(),
});

export const chatSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  createdAt: z.date(),
  title: z.string(),
  visibility: z.enum(["public", "private"]),
  lastContext: z.object({}).nullable().optional(),
});

export type Chat = z.infer<typeof chatSchema>;
