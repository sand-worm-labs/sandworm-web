import { pgTable, varchar, timestamp } from "drizzle-orm/pg-core";

// Session table
export const sessions = pgTable("sessions", {
  sessionToken: varchar("session_token", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});
