import type { NeonDatabase } from "drizzle-orm/neon-serverless";
import type * as schema from "../schemas";
import { TransactionalAdapterDrizzleOrm } from '@nestjs-cls/transactional-adapter-drizzle-orm';
import { drizzle as neonDrizzle } from "drizzle-orm/neon-serverless";

export type SandwormDatabaseSchema = typeof schema;

export type SandwormDatabase = NeonDatabase<SandwormDatabaseSchema>;

export type SandwormTransactionAdapter = TransactionalAdapterDrizzleOrm<ReturnType<typeof neonDrizzle>>;