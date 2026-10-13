import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { BountyEntity } from './bounty.entity';
import { DocumentEntity } from './document.entity';
import { NotebookAttestationEntity } from './notebook-attestation.entity';
import { UserEntity } from './user.entity';

// The notebook someone is writing for a bounty. One per person per bounty.
@Entity('bounty_entry')
@Index('UQ_bounty_entry_bounty_author', ['bountySlug', 'authorId'], { unique: true })
export class BountyEntryEntity extends AbstractEntity {
  constructor(data?: Partial<BountyEntryEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_bounty_entry_id' })
  id!: string;

  @Column({ name: 'bounty_slug' })
  bountySlug!: string;

  @Column({ name: 'document_id', type: 'uuid' })
  documentId!: string;

  @Column({ name: 'author_id', type: 'uuid' })
  authorId!: string;

  // Where the reward is sent if this entry wins. Asked for when the bounty is
  // funded in escrow.
  @Column({ type: 'varchar', nullable: true })
  wallet!: string | null;

  // The attestation that made this notebook trusted, set when it is submitted
  @Column({ name: 'attestation_id', type: 'uuid', nullable: true })
  attestationId!: string | null;

  // Null while the notebook is still being worked on
  @Column({ name: 'submitted_at', type: 'timestamptz', nullable: true })
  submittedAt!: Date | null;

  @ManyToOne(() => BountyEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'bounty_slug',
    referencedColumnName: 'slug',
    foreignKeyConstraintName: 'FK_bounty_entry_bounty',
  })
  bounty!: Relation<BountyEntity>;

  @ManyToOne(() => DocumentEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'document_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_bounty_entry_document',
  })
  document!: Relation<DocumentEntity>;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'author_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_bounty_entry_author',
  })
  author!: Relation<UserEntity>;

  @ManyToOne(() => NotebookAttestationEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({
    name: 'attestation_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_bounty_entry_attestation',
  })
  attestation!: Relation<NotebookAttestationEntity> | null;
}
