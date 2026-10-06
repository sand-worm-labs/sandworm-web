import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Plan, WorkspaceEntity } from '@sandworm/postgresql-typeorm';
import { Repository } from 'typeorm';

export const PAID_PLAN_ERROR = 'PaidPlanRequired';
export const paidPlanMessage = (source: string) =>
  `${source} needs a paid plan. This workspace is on the free plan: upgrade it in Settings > Plan, or use DuckDB and public APIs instead.`;
export const proPlanMessage = (source: string) =>
  `${source} needs the Pro plan. Upgrade this workspace in Settings > Plan, or use Sandworm Cloud, DuckDB and public APIs instead.`;

// Sandworm Cloud is for paid workspaces: every plan but free, the trial
// included. Dune bills us per query, so it is Pro and Enterprise only. A
// workspace that cannot be found counts as free.
@Injectable()
export class PaidPlanService {
  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  private async planOf(workspaceId: string): Promise<Plan> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
      select: { id: true, plan: true },
    });
    return workspace?.plan ?? Plan.FREE;
  }

  async isPaid(workspaceId: string): Promise<boolean> {
    return (await this.planOf(workspaceId)) !== Plan.FREE;
  }

  async canUseDune(workspaceId: string): Promise<boolean> {
    const plan = await this.planOf(workspaceId);
    return plan === Plan.PRO || plan === Plan.ENTERPRISE;
  }
}
