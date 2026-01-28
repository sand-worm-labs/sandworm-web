import { Module } from '@nestjs/common';
import { DataSourcesController } from './datasource.controller';
import { SandwormCloudModule } from './sandworm-cloud/sandworm-cloud.module';

@Module({
    imports: [SandwormCloudModule],
    controllers: [DataSourcesController],
    exports: [SandwormCloudModule],
})
export class DataSourcesModule { }