import {
  boolean,
  foreignKey,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { z } from "zod";

import { UserTable } from "./user";
import { DocumentTable } from "./document";

export const suggestion = pgTable(
  "Suggestion",
  {
    id: uuid("id").notNull().defaultRandom(),
    documentId: uuid("documentId").notNull(),
    documentCreatedAt: timestamp("documentCreatedAt").notNull(),
    originalText: text("originalText").notNull(),
    suggestedText: text("suggestedText").notNull(),
    description: text("description"),
    isResolved: boolean("isResolved").notNull().default(false),
    userId: uuid("userId")
      .notNull()
      .references(() => UserTable.id),
    createdAt: timestamp("createdAt").notNull(),
  },
  table => ({
    pk: primaryKey({ columns: [table.id] }),
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [DocumentTable.id, DocumentTable.createdAt],
    }),
  })
);

// ============== Suggestion Schema Type ==============
export const suggestionSchema = z.object({
  id: z.string().uuid(),
  documentId: z.string().uuid(),
  documentCreatedAt: z.date(),
  originalText: z.string(),
  suggestedText: z.string(),
  description: z.string().nullable().optional(),
  isResolved: z.boolean().default(false),
  userId: z.string().uuid(),
  createdAt: z.date(),
});

export type Suggestion = z.infer<typeof suggestionSchema>;
