import * as dotenv from "dotenv";
import type { Config } from "drizzle-kit";

dotenv.config();

interface EnvConfig {
  DATABASE_URL: string;
  DATABASE_TEST_URL?: string;
  NODE_ENV?: string;
}

const env: EnvConfig = {
  DATABASE_URL: process.env["DATABASE_URL"] || "",
  DATABASE_TEST_URL: process.env["DATABASE_TEST_URL"],
  NODE_ENV: process.env.NODE_ENV,
};

// Determine connection string based on environment
const connectionString =
  env.NODE_ENV === "test" && env.DATABASE_TEST_URL
    ? env.DATABASE_TEST_URL
    : env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "`DATABASE_URL` or `DATABASE_TEST_URL` not found in environment"
  );
}

export default {
  dbCredentials: {
    url: connectionString,
  },
  dialect: "postgresql",
  out: "./packages/database/migrations",
  schema: "./packages/database/src/schemas",
  strict: true,
} satisfies Config;
