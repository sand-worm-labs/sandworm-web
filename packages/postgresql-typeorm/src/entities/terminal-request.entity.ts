import type {
  RequestKindId,
  RequestScope,
  RequestStatusId,
  RequestTimingId,
  RequestUseCaseId,
} from '@sandworm/types/terminal';
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { TerminalClientEntity } from './terminal-client.entity';
import { TerminalMemberEntity } from './terminal-member.entity';

// A request a member of a terminal client submits. Sandworm's agents do the
// work: for research they propose a scope, the client approves it, and the run
// ends in a report. A question is answered straight away, with no scope.
// The timeline the terminal shows is read from the timestamps below.
@Entity('terminal_request')
@Index('IDX_terminal_request_client', ['clientId', 'kind', 'submittedAt'])
export class TerminalRequestEntity extends AbstractEntity {
  constructor(data?: Partial<TerminalRequestEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_terminal_request_id' })
  id!: string;

  @Column({ name: 'client_id', type: 'uuid' })
  clientId!: string;

  @Column({ type: 'varchar', length: 16 })
  kind!: RequestKindId;

  // Who submitted it; null once they leave the client
  @Column({ name: 'requested_by', type: 'uuid', nullable: true })
  requestedBy!: string | null;

  @Column({ type: 'text' })
  question!: string;

  @Column({ name: 'use_case', type: 'varchar', length: 32, nullable: true })
  useCase!: RequestUseCaseId | null;

  // Subjects it is about ("Argentina", "Paycrest")
  @Column({ type: 'text', array: true, default: '{}' })
  about!: string[];

  @Column({ type: 'varchar', length: 16, nullable: true })
  timing!: RequestTimingId | null;

  // Names of the files the member attached
  @Column({ type: 'text', array: true, default: '{}' })
  files!: string[];

  @Column({ type: 'varchar', length: 24, default: 'submitted' })
  status!: RequestStatusId;

  // The agent's proposed plan, for research only
  @Column({ type: 'jsonb', nullable: true })
  scope!: RequestScope | null;

  // The agent job working on it. Not a foreign key: runs live outside this database.
  @Column({ name: 'agent_run_id', type: 'varchar', length: 128, nullable: true })
  agentRunId!: string | null;

  // The agent's latest one-line status, shown on the request
  @Column({ name: 'progress_note', type: 'text', nullable: true })
  progressNote!: string | null;

  // The answer to a question, or why research was declined or failed
  @Column({ type: 'text', nullable: true })
  outcome!: string | null;

  // The report it was delivered as (terminal_report, once that table exists)
  @Column({ name: 'report_id', type: 'uuid', nullable: true })
  reportId!: string | null;

  @Column({ name: 'submitted_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  submittedAt!: Date;

  @Column({ name: 'scoped_at', type: 'timestamptz', nullable: true })
  scopedAt!: Date | null;

  // Approval starts the work, and is when research counts toward the allowance
  @Column({ name: 'approved_at', type: 'timestamptz', nullable: true })
  approvedAt!: Date | null;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy!: string | null;

  // Delivered, declined or failed
  @Column({ name: 'closed_at', type: 'timestamptz', nullable: true })
  closedAt!: Date | null;

  @ManyToOne(() => TerminalClientEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id', referencedColumnName: 'id', foreignKeyConstraintName: 'FK_terminal_request_client' })
  client!: Relation<TerminalClientEntity>;

  @ManyToOne(() => TerminalMemberEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'requested_by', referencedColumnName: 'id', foreignKeyConstraintName: 'FK_terminal_request_requester' })
  requester!: Relation<TerminalMemberEntity> | null;

  @ManyToOne(() => TerminalMemberEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'approved_by', referencedColumnName: 'id', foreignKeyConstraintName: 'FK_terminal_request_approver' })
  approver!: Relation<TerminalMemberEntity> | null;
}
