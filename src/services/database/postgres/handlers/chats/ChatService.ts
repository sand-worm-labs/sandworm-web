import type { Message } from "ai";
import { db } from "@/services/database/postgres";
import type { ServiceResult } from "@/services/database/postgres/types";
import { DataResult } from "@/services/database/postgres/types";
import { chats } from "@/services/database/postgres/schema";

export interface Chat {
  id?: number;
  userId: string;
  createdAt: Date;
  messages: Message[];
}

export class ChatService {
  static async saveChat({
    id,
    userId,
    messages,
  }: {
    id?: number;
    userId: string;
    messages: Message[];
  }): Promise<ServiceResult<Chat>> {
    try {
      if (id) {
        const updated = await db
          .update(chats)
          .set({ messages })
          .where(chats.id.eq(id))
          .returning();

        if (updated.length === 0)
          return DataResult.failure("Chat not found.", "NOT_FOUND");

        return DataResult.success(updated[0]);
      }

      const inserted = await db
        .insert(chats)
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
      const result = await db.delete(chats).where(chats.id.eq(id));
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
      const chat = await db.select().from(chats).where(chats.id.eq(id)).get();
      if (!chat) return DataResult.failure("Chat not found.", "NOT_FOUND");
      return DataResult.success(chat);
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
        .from(chats)
        .where(chats.userId.eq(userId));
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
