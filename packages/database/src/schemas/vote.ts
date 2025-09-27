import { pgTable, uuid, primaryKey, boolean } from "drizzle-orm/pg-core";
import { z } from "zod";

import { ChatTable } from "./chat";
import { MessageTable } from "./message";
import { UserTable } from "./user";

export const VoteTable = pgTable(
  "votes",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => UserTable.id, { onDelete: "cascade" }),
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

// ==============  Vote Schema Type ==============
