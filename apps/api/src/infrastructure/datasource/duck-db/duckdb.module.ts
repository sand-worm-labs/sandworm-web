import { Global, Module } from '@nestjs/common';
import { DuckDBService } from './duckdb.service';
import { DuckDBQueryService } from './duckdb-query.service';
import { DuckDBDataSourceService } from './duckdb-datasource.service';

@Global()
@Module({
    providers: [DuckDBService, DuckDBQueryService, DuckDBDataSourceService],
    exports: [DuckDBService, DuckDBQueryService, DuckDBDataSourceService],
})
export class DuckDBModule {}