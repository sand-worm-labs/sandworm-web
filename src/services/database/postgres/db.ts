import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

import * as schema from "./schema";

// Validate the presence of the DATABASE_URL environment variable
if (!process.env.DATABASE_URL) {
  console.error(
    "❌ Error: Database URL is not specified in the environment variables."
  );
  process.exit(1); // Exit with an error code if DATABASE_URL is missing
}

// Initialize the postgres client with the DATABASE_URL
const client = postgres(process.env.DATABASE_URL, { max: 1 });

// Configure and initialize the drizzle client with the specified schema
export const db = drizzle(client, { schema });
