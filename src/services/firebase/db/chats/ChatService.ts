import type { Message } from "ai";
import type { ServiceResult, Result, Schema } from "@/services/firebase/db";
import { db, DataResult, toResult, toResults } from "@/services/firebase/db";

export interface Chat {
  userId: string;
  createdAt: Date;
  messages: Message[];
}

export type ChatDoc = Schema["chats"]["Doc"];
export type ChatResult = Result<Chat>;

export class ChatService {
  static async saveChat({
    id,
    userId,
    messages,
  }: {
    id: string;
    userId: string;
    messages: Message[];
  }): Promise<ServiceResult<ChatResult>> {
    try {
      const existing = await db.chats.get(id);

      if (existing) {
        await db.chats.update(id, { messages });
        const updated = await db.chats.get(id);
        if (!updated)
          return DataResult.failure(
            "Failed to retrieve updated chat.",
            "NOT_FOUND"
          );
        return DataResult.success(toResult<Chat>(updated));
      }

      await db.chats.set(id, {
        userId,
        createdAt: new Date(),
        messages,
      });

      const created = await db.chats.get(id);
      if (!created)
        return DataResult.failure(
          "Failed to retrieve created chat.",
          "NOT_FOUND"
        );

      return DataResult.success(toResult<Chat>(created));
    } catch (error) {
      return DataResult.failure("Failed to save chat.", "DB_ERROR", error);
    }
  }

  static async deleteChatById({
    id,
  }: {
    id: string;
  }): Promise<ServiceResult<boolean>> {
    try {
      await db.chats.remove(id);
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
    id: string;
  }): Promise<ServiceResult<ChatResult>> {
    try {
      const chatDoc = await db.chats.get(id);
      if (!chatDoc) return DataResult.failure("Chat not found.", "NOT_FOUND");

      return DataResult.success(toResult<Chat>(chatDoc));
    } catch (error) {
      return DataResult.failure("Failed to fetch chat.", "DB_ERROR", error);
    }
  }

  static async getChatsByUserId({
    id,
  }: {
    id: string;
  }): Promise<ServiceResult<ChatResult[]>> {
    try {
      const chats = await db.chats.query($ => [$.field("userId").eq(id)]);

      return DataResult.success(toResults<Chat>(chats));
    } catch (error) {
      return DataResult.failure(
        "Failed to fetch user chats.",
        "DB_ERROR",
        error
      );
    }
  }
}
