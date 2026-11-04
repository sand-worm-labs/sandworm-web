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

  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId!: string;

  // An OrganisationTypeId (@sandworm/types/terminal)
  @Column({ type: 'varchar', length: 32 })
  type!: string;

  @Column({ type: 'varchar', length: 120, default: '' })
  name!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  website!: string;

  // What the organisation does, in the client's words
  @Column({ type: 'varchar', length: 500, default: '' })
  description!: string;

  // A SetupTracking (@sandworm/types/terminal)
  @Column({ type: 'jsonb', default: '{}' })
  tracking!: Record<string, unknown>;

  // GoalIds, at most MAX_GOALS
  @Column({ type: 'text', array: true, default: '{}' })
  goals!: string[];

  // TeamInvites, not sent until setup is finished
  @Column({ type: 'jsonb', default: '[]' })
  invites!: Record<string, unknown>[];

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'owner_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_terminal_client_owner',
  })
  owner!: Relation<UserEntity>;
}
