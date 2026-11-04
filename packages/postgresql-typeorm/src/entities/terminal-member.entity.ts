import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { TerminalClientEntity } from './terminal-client.entity';
import { UserEntity } from './user.entity';

// A person who can open a terminal client. The owner is a member too, as admin.
// Read state and "since your last visit" are per member, not per client.
@Entity('terminal_member')
@Index('UQ_terminal_member_client_user', ['clientId', 'userId'], { unique: true })
@Index('IDX_terminal_member_user', ['userId'])
export class TerminalMemberEntity extends AbstractEntity {
  constructor(data?: Partial<TerminalMemberEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_terminal_member_id' })
  id!: string;

  @Column({ name: 'client_id', type: 'uuid' })
  clientId!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  // An AccessLevelId (@sandworm/types/terminal)
  @Column({ type: 'varchar', length: 16, default: 'view' })
  access!: string;

  // When the member last opened Briefing; null until their first visit
  @Column({ name: 'last_seen_briefing_at', type: 'timestamptz', nullable: true })
  lastSeenBriefingAt!: Date | null;

  @ManyToOne(() => TerminalClientEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'client_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_terminal_member_client',
  })
  client!: Relation<TerminalClientEntity>;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_terminal_member_user',
  })
  user!: Relation<UserEntity>;
}
