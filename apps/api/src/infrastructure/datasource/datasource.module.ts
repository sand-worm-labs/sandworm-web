import { Module } from '@nestjs/common';
import { DataSourcesController } from './datasource.controller';
import { SandwormCloudModule } from './sandworm-cloud/sandworm-cloud.module';
import { DuckDBModule } from './duck-db/duckdb.module';
import { DuneModule } from './dune/dune.module';

@Module({
    imports: [SandwormCloudModule, DuckDBModule, DuneModule],
    controllers: [DataSourcesController],
    exports: [SandwormCloudModule, DuckDBModule, DuneModule],
})
export class DataSourcesModule { }