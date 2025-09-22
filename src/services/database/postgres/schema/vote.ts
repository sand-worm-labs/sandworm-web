import { pgTable, uuid, primaryKey, boolean } from "drizzle-orm/pg-core";
import { z } from "zod";

import { ChatTable } from "./chat";
import { message } from "./message";

export const vote = pgTable(
  "votes",
  {
    chatId: uuid("chatId")
      .notNull()
      .references(() => ChatTable.id),
    messageId: uuid("messageId")
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean("isUpvoted").notNull(),
  },
  table => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  }
);

// ==============  Vote Schema Type ==============
export const voteSchema = z.object({
  chatId: z.string().uuid(),
  messageId: z.string().uuid(),
  isUpvoted: z.boolean(),
});

export type Vote = z.infer<typeof voteSchema>;
