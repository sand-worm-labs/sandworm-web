import { config } from "dotenv";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

config({ path: ".env" }); // or .env.local

const getEnvVariable = (name: string) => {
	const value = process.env[name];
	if (value == null) throw new Error(`environment variable ${name} not found`);
	return value;
};

const pool = new Pool({ connectionString: getEnvVariable("DATABASE_URL") });

export const db = drizzle(pool);

// WITH NEON ADAPTER
// import { drizzle } from "drizzle-orm/neon-http";
// import { neon } from "@neondatabase/serverless";
// import { keys } from "./keys";

// const client = neon(keys().DATABASE_URL);

// export const database = drizzle({ client });