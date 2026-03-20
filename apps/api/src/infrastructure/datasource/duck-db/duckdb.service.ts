import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as duckdb from 'duckdb';

@Injectable()
export class DuckDBService implements OnModuleDestroy {
    private db: duckdb.Database;

    constructor() {
        this.db = new duckdb.Database(':memory:');
    }

    query(sql: string): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this.db.all(sql, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    getDatabase(): duckdb.Database {
        return this.db;
    }

    onModuleDestroy() {
        this.db.close();
    }
}