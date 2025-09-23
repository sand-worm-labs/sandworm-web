import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod";

import { UserTable } from "./user";

export const SessionTable = pgTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => UserTable.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const sessionSchema = z.object({
  sessionToken: z.string().max(255),
  userId: z.string().max(255),
  expires: z.date(),
});

export type Session = z.infer<typeof sessionSchema>;
