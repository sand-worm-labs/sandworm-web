import { SandwormDatabase } from "../type";
import { getDBInstance } from "./web-server";

export class DatabaseAdapter {
    private static instance: SandwormDatabase | null = null;

    // Prevent direct instantiation
    private constructor() { }

    public static async getInstance(): Promise<SandwormDatabase> {
        if (DatabaseAdapter.instance) return DatabaseAdapter.instance;

        try {
            DatabaseAdapter.instance = getDBInstance();
            return DatabaseAdapter.instance;
        } catch (error) {
            console.error("❌ Failed to initialize database:", error);
            throw error;
        }
    }

    // Optional: if you need a synchronous accessor (already initialized)
    public static getUnsafeInstance(): SandwormDatabase {
        if (!DatabaseAdapter.instance) {
            throw new Error("Database not initialized. Call getInstance() first.");
        }
        return DatabaseAdapter.instance;
    }

    // Optional: reset (for tests)
    public static reset(): void {
        DatabaseAdapter.instance = null;
    }
}

