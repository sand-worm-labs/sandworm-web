import { pgTable, varchar, timestamp, uuid, text } from "drizzle-orm/pg-core";
import { z } from "zod";

import { user } from "./user";

export const document = pgTable("Document", {
  id: uuid("id").notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  title: text("title").notNull(),
  content: text("content"),
  kind: varchar("text", { enum: ["text", "code", "image", "sheet"] })
    .notNull()
    .default("text"),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
});

// ============== Document Schema Type ==============
export const documentSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  title: z.string(),
  content: z.string().nullable().optional(),
  kind: z.enum(["text", "code", "image", "sheet"]).default("text"),
  userId: z.string().uuid(),
});

export type Document = z.infer<typeof documentSchema>;
