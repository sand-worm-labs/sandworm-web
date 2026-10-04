import { Module } from '@nestjs/common';
import { DataSourcesController } from './datasource.controller';
import { SandwormCloudModule } from './sandworm-cloud/sandworm-cloud.module';
import { DuckDBModule } from './duck-db/duckdb.module';
import { DuneModule } from './dune/dune.module';
import { ChainSqlService } from './chain-sql.service';
import { CodeExecutionModule } from '@/features/code-execution/code-execution.module';

@Module({
    imports: [SandwormCloudModule, DuckDBModule, DuneModule, CodeExecutionModule],
    controllers: [DataSourcesController],
    providers: [ChainSqlService],
    exports: [SandwormCloudModule, DuckDBModule, DuneModule, ChainSqlService],
})
export class DataSourcesModule { }