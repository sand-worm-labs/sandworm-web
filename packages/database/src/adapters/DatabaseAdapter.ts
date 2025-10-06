import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { drizzle as neonDrizzle } from 'drizzle-orm/neon-serverless';
import { drizzle as nodeDrizzle } from 'drizzle-orm/node-postgres';
import { Pool as NodePool } from 'pg';
import ws from 'ws';

import { dbEnv } from '../../config';
import { SandwormDatabase } from '../type';
import * as schema from '../schemas'; // ensure this path is valid

export class DatabaseAdapter {
    private static instance: SandwormDatabase | null = null;

    private constructor() { }

    private static createInstance(): SandwormDatabase {
        const { DATABASE_URL, DATABASE_DRIVER, KEY_VAULTS_SECRET } = dbEnv;

        if (process.env['NEXT_PUBLIC_SERVICE_MODE'] === "server") {
            throw new Error('Database can only be initialized in server mode');
        }

        if (!KEY_VAULTS_SECRET) {
            throw new Error(
                '`KEY_VAULTS_SECRET` is not set. Run `openssl rand -base64 32` to create one.'
            );
        }

        if (!DATABASE_URL) {
            throw new Error('`DATABASE_URL` is missing from environment variables');
        }

        // Node driver
        if (DATABASE_DRIVER === 'node') {
            const pool = new NodePool({ connectionString: DATABASE_URL });
            return nodeDrizzle(pool, { schema });
        }

        // Neon (serverless)
        if (process.env["MIGRATION_DB"] === '1') {
            neonConfig.webSocketConstructor = ws;
        }

        const pool = new NeonPool({ connectionString: DATABASE_URL });
        return neonDrizzle(pool, { schema });
    }

    public static async getInstance(): Promise<SandwormDatabase> {
        if (!DatabaseAdapter.instance) {
            try {
                DatabaseAdapter.instance = DatabaseAdapter.createInstance();
            } catch (error) {
                console.error('❌ Failed to initialize database:', error);
                throw error;
            }
        }

        return DatabaseAdapter.instance;
    }

    public static getUnsafeInstance(): SandwormDatabase {
        if (!DatabaseAdapter.instance) {
            throw new Error('Database not initialized. Call getInstance() first.');
        }
        return DatabaseAdapter.instance;
    }

    public static reset(): void {
        DatabaseAdapter.instance = null;
    }
}