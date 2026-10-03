import { Injectable } from '@nestjs/common';
import { DuneDataSourceService } from './dune/dune-datasource.service';
import { SandwormCloudDataSourceService } from './sandworm-cloud/sandworm-cloud-datasource.service';

export type ChainSqlStatus = { available: boolean; sources: { dune: boolean; sandworm_cloud: boolean } };

// Of the three data sources, Dune and Sandworm Cloud hold chain data; local
// DuckDB only queries what a notebook has already loaded. When neither of the
// first two can run SQL, notebooks are built from public APIs instead (the AI
// sidecar and apps/mcp both ask here).
@Injectable()
export class ChainSqlService {
    constructor(
        private readonly dune: DuneDataSourceService,
        private readonly sandwormCloud: SandwormCloudDataSourceService,
    ) { }

    async status(): Promise<ChainSqlStatus> {
        const [dune, sandworm_cloud] = await Promise.all([this.dune.canRunSql(), this.sandwormCloud.canRunSql()]);
        return { available: dune || sandworm_cloud, sources: { dune, sandworm_cloud } };
    }
}
