import {
  foreignKey,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { z } from "zod";

import { ChatTable } from "./chat";

export const stream = pgTable(
  "Stream",
  {
    id: uuid("id").notNull().defaultRandom(),
    chatId: uuid("chatId").notNull(),
    createdAt: timestamp("createdAt").notNull(),
  },
  table => ({
    pk: primaryKey({ columns: [table.id] }),
    chatRef: foreignKey({
      columns: [table.chatId],
      foreignColumns: [ChatTable.id],
    }),
  })
);
// ============== Stream Schema Type ==============
export const streamSchema = z.object({
  id: z.string().uuid(),
  chatId: z.string().uuid(),
  createdAt: z.date(),
});

export type Stream = z.infer<typeof streamSchema>;
