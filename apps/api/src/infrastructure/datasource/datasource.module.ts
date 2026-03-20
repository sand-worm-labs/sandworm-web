import { Module } from '@nestjs/common';
import { DataSourcesController } from './datasource.controller';
import { SandwormCloudModule } from './sandworm-cloud/sandworm-cloud.module';
import { DuckDBModule } from './duck-db/duckdb.module';

@Module({
    imports: [SandwormCloudModule, DuckDBModule],
    controllers: [DataSourcesController],
    exports: [SandwormCloudModule, DuckDBModule],
})
export class DataSourcesModule { }