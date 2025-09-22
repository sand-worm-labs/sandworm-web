import { migrate } from "drizzle-orm/postgres-js/migrator";
import dotenv from "dotenv";

import { db } from "../db";

dotenv.config();

/**
 * Executes database migration using drizzle-ORM.
 * It logs the migration start and completion statuses.
 * In case of an error, it logs the error and exits the process with status code 1.
 */
const migrateDatabase = async () => {
  console.log("🚀 Starting database migration...");

  try {
    // Perform the migration using the configured database connection and migration folder
    await migrate(db, { migrationsFolder: "migrations" });
    console.log("✅ Successfully completed the database migration.");

    // Exit the process successfully
    process.exit(0);
  } catch (error) {
    // Log the error with a descriptive message
    console.error("❌ Error during the database migration:", error);

    // Exit the process with an error code
    process.exit(1);
  }
};

// Execute the migration function
migrateDatabase();
