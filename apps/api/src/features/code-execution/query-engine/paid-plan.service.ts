import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Plan, WorkspaceEntity } from '@sandworm/postgresql-typeorm';
import { Repository } from 'typeorm';

export const PAID_PLAN_ERROR = 'PaidPlanRequired';
export const paidPlanMessage = (source: string) =>
  `${source} needs a paid plan. This workspace is on the free plan: upgrade it in Settings > Plan, or use DuckDB and public APIs instead.`;

// Dune and Sandworm Cloud are for paid workspaces: every plan but free, the
// trial included. A workspace that cannot be found counts as free.
@Injectable()
export class PaidPlanService {
  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  async isPaid(workspaceId: string): Promise<boolean> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
      select: { id: true, plan: true },
    });
    return !!workspace && workspace.plan !== Plan.FREE;
  }
}
