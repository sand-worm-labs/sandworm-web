import "dotenv/config";

import { join } from "node:path";

import { migrate as neonMigrate } from "drizzle-orm/neon-serverless/migrator";
import { migrate as nodeMigrate } from "drizzle-orm/node-postgres/migrator";

import { DB_FAIL_INIT_HINT, PGVECTOR_HINT } from "./migrationErrors";

const migrationsFolder = join(__dirname, "../../packages/database/migrations");

const runMigrations = async () => {
  const { serverDB } = await import("../../packages/database/src/server");

  if (process.env.DATABASE_DRIVER === "node") {
    await nodeMigrate(serverDB, { migrationsFolder });
  } else {
    await neonMigrate(serverDB, { migrationsFolder });
  }

  console.log("✅ database migration pass.");
  process.exit(0);
};

const connectionString = process.env.DATABASE_URL;

// only migrate database if the connection string is available
if (connectionString) {
  runMigrations().catch(err => {
    console.error("❌ Database migrate failed:", err);

    const errMsg = err.message as string;

    if (errMsg.includes('extension "vector" is not available')) {
      console.info(PGVECTOR_HINT);
    } else if (
      errMsg.includes(`Cannot read properties of undefined (reading 'migrate')`)
    ) {
      console.info(DB_FAIL_INIT_HINT);
    }

    process.exit(1);
  });
} else {
  console.log("🟢 not find database env, migration skipped");
}
