import { pgTable, primaryKey, timestamp, uuid } from "drizzle-orm/pg-core";
import { z } from "zod";

import { ChatTable } from "./chat";

export const StreamTable = pgTable(
  "streams",
  {
    id: uuid("id").notNull().defaultRandom(),
    chatId: uuid("chatId")
      .notNull()
      .references(() => ChatTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("createdAt").notNull(),
  },
  table => [primaryKey({ columns: [table.id] })]
);
// ============== Stream Schema Type ==============
export const streamSchema = z.object({
  id: z.string().uuid(),
  chatId: z.string().uuid(),
  createdAt: z.date(),
});

export type Stream = z.infer<typeof streamSchema>;
