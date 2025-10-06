import "dotenv/config";
import { join } from "node:path";
import { migrate as neonMigrate } from "drizzle-orm/neon-serverless/migrator";
import { migrate as nodeMigrate } from "drizzle-orm/node-postgres/migrator";

import { DatabaseAdapter } from "../../src/adapters/DatabaseAdapter";
import { DB_FAIL_INIT_HINT, PGVECTOR_HINT } from "./migrationErrors";

const migrationsFolder = join(__dirname, "../../packages/database/migrations");

const runMigrations = async () => {
  const serverDB = await DatabaseAdapter.getInstance(); // Drizzle client

  const driver = process.env.DATABASE_DRIVER;
  if (!driver || !["node", "neon"].includes(driver)) {
    throw new Error("DATABASE_DRIVER must be set to 'node' or 'neon'");
  }

  if (driver === "node") {
    await nodeMigrate(serverDB, { migrationsFolder });
  } else {
    await neonMigrate(serverDB, { migrationsFolder });
  }
};

(async () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.log("🟢 DATABASE_URL not found, migration skipped");
    process.exit(0);
  }

  try {
    await runMigrations();
    console.log("✅ Database migration pass.");
    process.exit(0);
  } catch (err: any) {
    console.error("❌ Database migrate failed:", err);

    const errMsg = err.message ?? "";

    if (errMsg.includes('extension "vector" is not available')) {
      console.info(PGVECTOR_HINT);
    } else if (errMsg.includes(`Cannot read properties of undefined (reading 'migrate')`)) {
      console.info(DB_FAIL_INIT_HINT);
    }
    process.exit(1);
  }
})();
