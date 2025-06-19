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
  static async create(
    id: string,
    userId: string,
    messages: Message[]
  ): Promise<ServiceResult<ChatResult>> {
    try {
      const existing = await db.chats.get(id);
      if (existing) {
        // If chat with same ID exists, update messages
        await db.chats.update(id, {
          messages,
        });
        const updated = await db.chats.get(id);
        if (!updated) {
          return DataResult.failure(
            "Failed to retrieve updated chat.",
            "NOT_FOUND"
          );
        }
        return DataResult.success(toResult<Chat>(updated));
      }

      // Create new chat
      await db.chats.set(id, {
        userId,
        messages,
        createdAt: new Date(),
      });

      const created = await db.chats.get(id);
      if (!created) {
        return DataResult.failure(
          "Failed to retrieve created chat.",
          "NOT_FOUND"
        );
      }
      return DataResult.success(toResult<Chat>(created));
    } catch (error) {
      return DataResult.failure("Failed to save chat.", "DB_ERROR", error);
    }
  }

  static async getById(id: string): Promise<ServiceResult<ChatResult>> {
    try {
      const chatDoc = await db.chats.get(id);
      if (!chatDoc) {
        return DataResult.failure("Chat not found.", "NOT_FOUND");
      }
      return DataResult.success(toResult<Chat>(chatDoc));
    } catch (error) {
      return DataResult.failure("Failed to fetch chat.", "DB_ERROR", error);
    }
  }

  static async getByUserId(
    userId: string
  ): Promise<ServiceResult<ChatResult[]>> {
    try {
      const chatDocs = await db.chats.where("userId", "==", userId).get();
      return DataResult.success(toResults<Chat>(chatDocs));
    } catch (error) {
      return DataResult.failure(
        "Failed to fetch user chats.",
        "DB_ERROR",
        error
      );
    }
  }

  static async delete(id: string): Promise<ServiceResult<boolean>> {
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
}
