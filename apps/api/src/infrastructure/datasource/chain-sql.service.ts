import { Injectable } from '@nestjs/common';
import { DuneDataSourceService } from './dune/dune-datasource.service';
import { SandwormCloudDataSourceService } from './sandworm-cloud/sandworm-cloud-datasource.service';
import { PaidPlanService } from '@/features/code-execution/query-engine/paid-plan.service';

export type ChainSqlStatus = {
    available: boolean;
    paidPlanRequired: boolean;
    sources: { dune: boolean; sandworm_cloud: boolean };
};

// Of the three data sources, Dune and Sandworm Cloud hold chain data; local
// DuckDB only queries what a notebook has already loaded. When neither of the
// first two can run SQL, notebooks are built from public APIs instead (the AI
// sidecar and apps/mcp both ask here). A free workspace cannot use either; a
// trial workspace can use Sandworm Cloud but not Dune.
@Injectable()
export class ChainSqlService {
    constructor(
        private readonly dune: DuneDataSourceService,
        private readonly sandwormCloud: SandwormCloudDataSourceService,
        private readonly paidPlanService: PaidPlanService,
    ) { }

    async status(workspaceId: string): Promise<ChainSqlStatus> {
        const [cloudAllowed, duneAllowed] = await Promise.all([
            this.paidPlanService.isPaid(workspaceId),
            this.paidPlanService.canUseDune(workspaceId),
        ]);
        if (!cloudAllowed && !duneAllowed) {
            return { available: false, paidPlanRequired: true, sources: { dune: false, sandworm_cloud: false } };
        }
        const [dune, sandworm_cloud] = await Promise.all([
            duneAllowed && this.dune.canRunSql(),
            cloudAllowed && this.sandwormCloud.canRunSql(),
        ]);
        return { available: dune || sandworm_cloud, paidPlanRequired: false, sources: { dune, sandworm_cloud } };
    }
}
