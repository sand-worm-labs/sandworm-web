import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SandwormCloudDataSourceService } from './sandworm-cloud-datasource.service';
import { SandwormCloudQueryService } from './sandworm-cloud-query.service';

@Module({
    imports: [ConfigModule],
    providers: [
        SandwormCloudDataSourceService,
        SandwormCloudQueryService,
    ],
    exports: [
        SandwormCloudDataSourceService,
        SandwormCloudQueryService,
    ],
})
export class SandwormCloudModule { }