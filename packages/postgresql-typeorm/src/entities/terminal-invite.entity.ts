import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { TerminalClientEntity } from './terminal-client.entity';

// An invitation the Sandworm team made for a client's admin. It is claimed the first
// time someone signs in to Sandworm with this email, who then becomes a member.
@Entity('terminal_invite')
@Index('UQ_terminal_invite_client_email', ['clientId', 'email'], { unique: true })
@Index('IDX_terminal_invite_email', ['email'])
export class TerminalInviteEntity extends AbstractEntity {
  constructor(data?: Partial<TerminalInviteEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_terminal_invite_id' })
  id!: string;

  @Column({ name: 'client_id', type: 'uuid' })
  clientId!: string;

  // Lower case, so it matches however the person typed it when they signed up
  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ type: 'varchar', length: 120, default: '' })
  name!: string;

  // An AccessLevelId (@sandworm/types/terminal)
  @Column({ type: 'varchar', length: 16, default: 'admin' })
  access!: string;

  // An InviteStatusId (@sandworm/types/terminal)
  @Column({ type: 'varchar', length: 16, default: 'pending' })
  status!: string;

  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true })
  sentAt!: Date | null;

  @Column({ name: 'claimed_at', type: 'timestamptz', nullable: true })
  claimedAt!: Date | null;

  @ManyToOne(() => TerminalClientEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'client_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_terminal_invite_client',
  })
  client!: Relation<TerminalClientEntity>;
}
