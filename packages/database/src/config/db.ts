import { z } from "zod";

/**
 * 🧠 Database environment configuration
 *
 * Fully typed and validated via Zod
 * Safe for both runtime + build-time use
 * Includes migration mode toggle
 * Has sane defaults for local development
 */
const envSchema = z.object({
  DATABASE_DRIVER: z.enum(["neon", "node"]).default("neon"),
  DATABASE_URL: z.string().url(),
  DATABASE_TEST_URL: z.string().url().optional(),
  KEY_VAULTS_SECRET: z.string().optional(),
  REMOVE_GLOBAL_FILE: z
    .string()
    .default("1")
    .transform((v) => v !== "0"),
  MIGRATION_DB: z
    .string()
    .default("0")
    .transform((v) => v === "1"),
  NEXT_PUBLIC_IS_SERVER_MODE: z
    .string()
    .transform((v) => v === "server")
    .optional()
});

/**
 * Parse process.env using Zod
 */
export const dbEnv = envSchema.parse({
  DATABASE_DRIVER: process.env.DATABASE_DRIVER ?? "neon",
  DATABASE_URL:
    process.env.DATABASE_URL ??
    "postgres://postgres:postgres@localhost:5432/sandworm",
  DATABASE_TEST_URL: process.env.DATABASE_TEST_URL,
  KEY_VAULTS_SECRET: process.env.KEY_VAULTS_SECRET,
  REMOVE_GLOBAL_FILE: process.env.DISABLE_REMOVE_GLOBAL_FILE,
  MIGRATION_DB: process.env.MIGRATION_DB,
  NEXT_PUBLIC_IS_SERVER_MODE: process.env.NEXT_PUBLIC_SERVICE_MODE,
});