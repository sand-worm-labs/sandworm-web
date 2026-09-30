import { ForbiddenException } from '@nestjs/common';
import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { CurrentUser } from '@sandworm/graphql';
import {
  AuditResult,
  UserWorkspaceEntity,
  UserWorkspaceRole,
  UserWorkspaceStatus,
} from '@sandworm/postgresql-typeorm';
import { Repository } from 'typeorm';
import { NoAudit } from './audit.decorators';
import { AuditService } from './audit.service';
import { AuditLog } from './model/audit-log.model';

@Resolver(() => AuditLog)
@NoAudit()
export class AuditResolver {
  constructor(
    private readonly audit: AuditService,
    @InjectRepository(UserWorkspaceEntity)
    private readonly members: Repository<UserWorkspaceEntity>,
  ) {}

  @Query(() => [AuditLog], { name: 'auditLogs', description: 'Workspace audit trail (admins only), newest first' })
  async auditLogs(
    @CurrentUser('id') userId: string,
    @Args('workspaceId', { type: () => String }) workspaceId: string,
    @Args('actorId', { type: () => String, nullable: true }) actorId?: string,
    @Args('action', { type: () => String, nullable: true }) action?: string,
    @Args('result', { type: () => AuditResult, nullable: true }) result?: AuditResult,
    @Args('before', { type: () => Date, nullable: true }) before?: Date,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<AuditLog[]> {
    const membership = await this.members.findOne({
      where: { workspaceId, userId, status: UserWorkspaceStatus.ACTIVE },
    });
    if (membership?.role !== UserWorkspaceRole.ADMIN) {
      throw new ForbiddenException('Only workspace admins can read the audit log');
    }
    const rows = await this.audit.query({ workspaceId, actorId, action, result, before, limit });
    return rows as unknown as AuditLog[];
  }
}
