import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum AuditResult {
  SUCCESS = 'success',
  FAILURE = 'failure',
  DENIED = 'denied',
}

// Append-only: a DB trigger (see the add-audit-log migration) rejects UPDATE
// and DELETE, so there is deliberately no updatedAt and no AbstractEntity.
@Entity('audit_log')
@Index('IDX_audit_log_workspace_created', ['workspaceId', 'createdAt'])
@Index('IDX_audit_log_actor_created', ['actorId', 'createdAt'])
export class AuditLogEntity {
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_audit_log_id' })
  id!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  // No foreign keys on purpose: log rows must outlive the users and
  // workspaces they describe.
  @Column('uuid', { name: 'actor_id', nullable: true })
  actorId?: string | null;

  @Column('uuid', { name: 'workspace_id', nullable: true })
  workspaceId?: string | null;

  // e.g. "updateWorkspaceMemberRole", "auth.denied", "mcp.tool_call"
  @Column()
  action!: string;

  @Column({ name: 'resource_type', type: 'varchar', nullable: true })
  resourceType?: string | null;

  @Column({ name: 'resource_id', type: 'varchar', nullable: true })
  resourceId?: string | null;

  @Column({ type: 'enum', enum: AuditResult })
  result!: AuditResult;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string | null;

  @Column({ type: 'inet', nullable: true })
  ip?: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string | null;

  @Column({ name: 'request_id', type: 'varchar', nullable: true })
  requestId?: string | null;

  // Redacted arguments / before-after diff.
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown> | null;
}
