import { pgTable, uuid, primaryKey, boolean } from "drizzle-orm/pg-core";

import { ChatTable } from "./chat";
import { MessageTable } from "./message";
import { users } from "./user";

export const VoteTable = pgTable(
  "votes",
  {
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    chatId: uuid("chatId")
      .notNull()
      .references(() => ChatTable.id, { onDelete: "cascade" }),
    messageId: uuid("messageId")
      .notNull()
      .references(() => MessageTable.id, { onDelete: "cascade" }),
    isUpvoted: boolean("isUpvoted").notNull(),
  },
  vote => [
    {
      compoundKey: primaryKey({
        columns: [vote.userId, vote.chatId, vote.messageId],
      }),
    },
  ]
);
