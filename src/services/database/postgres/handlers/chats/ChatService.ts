import type { Message } from "ai";

import { db } from "@/services/database/postgres/db";
import type { ServiceResult } from "@/services/database/postgres/types";
import { DataResult } from "@/services/database/postgres/types";
import { chat } from "@/services/database/postgres/schema";
import type { Chat } from "@/services/database/postgres/schema";

export class ChatService {
  static async saveChat({
    id,
    userId,
    messages,
  }: {
    id?: string;
    userId: string;
    messages: Message[];
  }): Promise<ServiceResult<Chat>> {
    try {
      if (id) {
        const updated = await db
          .update(chat)
          .set({ messages })
          .where(chat.id.eq(id))
          .returning();

        if (updated.length === 0)
          return DataResult.failure("Chat not found.", "NOT_FOUND");

        return DataResult.success(updated[0]);
      }

      const inserted = await db
        .insert(chat)
        .values({ userId, messages })
        .returning();

      return DataResult.success(inserted[0]);
    } catch (error) {
      return DataResult.failure("Failed to save chat.", "DB_ERROR", error);
    }
  }

  static async deleteChatById({
    id,
  }: {
    id: number;
  }): Promise<ServiceResult<boolean>> {
    try {
      const result = await db.delete(chat).where(chat.id.eq(id));
      if (result === 0)
        return DataResult.failure("Chat not found.", "NOT_FOUND");
      return DataResult.success(true);
    } catch (error) {
      return DataResult.failure(
        "Failed to delete chat.",
        "DB_DELETE_ERROR",
        error
      );
    }
  }

  static async getChatById({
    id,
  }: {
    id: number;
  }): Promise<ServiceResult<Chat>> {
    try {
      const chatByid = await db.select().from(chat).where(chat.id.eq(id)).get();
      if (!chatByid) return DataResult.failure("Chat not found.", "NOT_FOUND");
      return DataResult.success(chatByid);
    } catch (error) {
      return DataResult.failure("Failed to fetch chat.", "DB_ERROR", error);
    }
  }

  static async getChatsByUserId({
    userId,
  }: {
    userId: string;
  }): Promise<ServiceResult<Chat[]>> {
    try {
      const allChats = await db
        .select()
        .from(chat)
        .where(chat.userId.eq(userId));
      return DataResult.success(allChats);
    } catch (error) {
      return DataResult.failure(
        "Failed to fetch user chats.",
        "DB_ERROR",
        error
      );
    }
  }
}
