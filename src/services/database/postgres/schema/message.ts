import { z } from "zod";
import { json, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { ChatTable } from "./chat";

export const MessageTable = pgTable("messages", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatId: uuid("chatId")
    .notNull()
    .references(() => ChatTable.id, { onDelete: "cascade" }),
  role: varchar("role").notNull(),
  parts: json("parts").notNull(),
  attachments: json("attachments").notNull(),
  createdAt: timestamp("createdAt").notNull(),
});

export const messageSchema = z.object({
  id: z.string().uuid(),
  chatId: z.string().uuid(),
  role: z.string(),
  parts: z.any(), // or a more specific shape
  attachments: z.any(),
  createdAt: z.date(),
});
export type Message = z.infer<typeof messageSchema>;
