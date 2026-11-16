import type { SubjectIcon } from '@sandworm/types/terminal';
import { Column, Entity, Index, JoinColumn, OneToOne, PrimaryGeneratedColumn, type Relation } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { UserEntity } from './user.entity';

// A client of the terminal (apps/terminal): the organisation and what its
// setup asked for. One per owner for now; members come with invites.
@Entity('terminal_client')
@Index('UQ_terminal_client_owner', ['ownerId'], { unique: true })
export class TerminalClientEntity extends AbstractEntity {
  constructor(data?: Partial<TerminalClientEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_terminal_client_id' })
  id!: string;

  // Null for a client the Sandworm team created, until its admin first logs in
  @Column({ name: 'owner_id', type: 'uuid', nullable: true })
  ownerId!: string | null;

  // An OrganisationTypeId (@sandworm/types/terminal)
  @Column({ type: 'varchar', length: 32 })
  type!: string;

  @Column({ type: 'varchar', length: 120, default: '' })
  name!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  website!: string;

  // Its logo, shown beside its name: a company logo by slug in the Showcase's logo store
  @Column({ type: 'jsonb', nullable: true })
  icon!: SubjectIcon | null;

  // A PlanId (@sandworm/types/terminal)
  @Column({ type: 'varchar', length: 16, default: 'starter' })
  plan!: string;

  // A ClientStatusId (@sandworm/types/terminal)
  @Column({ type: 'varchar', length: 16, default: 'live' })
  status!: string;

  // The team member who set the client up; null for a client that set itself up
  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy!: string | null;

  // Ids of the existing research the client starts with
  @Column({ name: 'starter_ids', type: 'text', array: true, default: '{}' })
  starterIds!: string[];

  // An InviteTimingId (@sandworm/types/terminal)
  @Column({ name: 'invite_timing', type: 'varchar', length: 16, default: 'manual' })
  inviteTiming!: string;

  // What the organisation does, in the client's words
  @Column({ type: 'varchar', length: 500, default: '' })
  description!: string;

  // A SetupTracking (@sandworm/types/terminal)
  @Column({ type: 'jsonb', default: '{}' })
  tracking!: Record<string, unknown>;

  // GoalIds, at most MAX_GOALS
  @Column({ type: 'text', array: true, default: '{}' })
  goals!: string[];

  // When the client last changed what it tracks. Set on that change, and cleared
  // once the next reading is recorded; while set, its Overview shows as recalculating.
  @Column({ name: 'tracking_changed_at', type: 'timestamptz', nullable: true })
  trackingChangedAt!: Date | null;

  // TeamInvites, not sent until setup is finished
  @Column({ type: 'jsonb', default: '[]' })
  invites!: Record<string, unknown>[];

  // Research requests a year; approving a scope uses one
  @Column({ name: 'research_allowance', type: 'integer', default: 5 })
  researchAllowance!: number;

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'owner_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_terminal_client_owner',
  })
  owner!: Relation<UserEntity> | null;
}
