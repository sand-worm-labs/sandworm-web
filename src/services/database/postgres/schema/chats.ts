import { pgTable, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod";

export const messages = pgTable("messages", {
  id: varchar("id", { length: 255 }).primaryKey(),
  chatId: varchar("chat_id", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull(), // e.g. "user" | "assistant"
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const chats = pgTable("chats", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// Messages table validation
export const messageSchema = z.object({
  id: z.string().max(255),
  chatId: z.string().max(255),
  role: z.enum(["user", "assistant"]), // restricts role
  content: z.string().min(1), // must not be empty
  createdAt: z.date(),
});

// Chats table validation
export const chatSchema = z.object({
  id: z.string().max(255),
  userId: z.string().max(255),
  createdAt: z.date(),
});

// Types from Zod
export type Message = z.infer<typeof messageSchema>;
export type Chat = z.infer<typeof chatSchema>;
