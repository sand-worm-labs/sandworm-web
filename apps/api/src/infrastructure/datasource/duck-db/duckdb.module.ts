import { Global, Module } from '@nestjs/common';
import { DuckDBDataSourceService } from './duckdb-datasource.service';

@Global()
@Module({
    providers: [  DuckDBDataSourceService],
    exports: [ DuckDBDataSourceService],
})
export class DuckDBModule {}