import { pgTable, varchar, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod";
// Session table
export const SessionTable = pgTable("Session", {
  sessionToken: varchar("session_token", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const sessionSchema = z.object({
  sessionToken: z.string().max(255),
  userId: z.string().max(255),
  expires: z.date(),
});

export type Session = z.infer<typeof sessionSchema>;
