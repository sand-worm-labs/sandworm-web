import type { NeonDatabase } from "drizzle-orm/neon-serverless";

import type * as schema from "./schemas";

export type SandwormDatabaseSchema = typeof schema;

export type SandwormDatabase = NeonDatabase<SandwormDatabaseSchema>;
