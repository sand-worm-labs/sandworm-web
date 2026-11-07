import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { DocumentEntity } from './document.entity';
import { TerminalClientEntity } from './terminal-client.entity';

// The client's own triage of a signal: we never call it an opportunity for them.
export const TERMINAL_SIGNAL_STATUSES = ['new', 'looking', 'acting', 'dismissed'] as const;
export type TerminalSignalStatus = (typeof TERMINAL_SIGNAL_STATUSES)[number];

// How strong the evidence behind it is
export const TERMINAL_EVIDENCE_LEVELS = ['strong', 'some', 'early'] as const;
export type TerminalEvidence = (typeof TERMINAL_EVIDENCE_LEVELS)[number];

// A pattern Sandworm's agents saw in a client's onchain data, and what it could
// mean for them. It says what was observed and leaves the call to the client.
// Each comes from a report (a document) and links back to it. Drafts
// (published_at null) are not shown to the client.
@Entity('terminal_signal')
@Index('IDX_terminal_signal_client', ['clientId', 'publishedAt'])
export class TerminalSignalEntity extends AbstractEntity {
  constructor(data?: Partial<TerminalSignalEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_terminal_signal_id' })
  id!: string;

  @Column({ name: 'client_id', type: 'uuid' })
  clientId!: string;

  @Column({ type: 'varchar', length: 16, default: 'new' })
  status!: TerminalSignalStatus;

  // What was seen, as a fact ("Argentina's off-ramps charge 2× Nigeria's fees")
  @Column({ type: 'varchar', length: 200 })
  title!: string;

  // The evidence in one line ("11,200 of your wallets cash out to pesos")
  @Column({ type: 'text', default: '' })
  observed!: string;

  // A hedged reading of it ("A cheaper route in-app could keep that flow")
  @Column({ name: 'could_mean', type: 'text', default: '' })
  couldMean!: string;

  // "Market", "Partner", "Product"
  @Column({ type: 'varchar', length: 32, default: '' })
  kind!: string;

  // The size of it, if there is one ("$14.2M/mo") and what it measures ("cashed out to pesos")
  @Column({ type: 'varchar', length: 32, default: '' })
  size!: string;

  @Column({ name: 'size_label', type: 'varchar', length: 64, default: '' })
  sizeLabel!: string;

  @Column({ type: 'varchar', length: 8 })
  evidence!: TerminalEvidence;

  // What it is about ("Argentina", "Paycrest")
  @Column({ type: 'varchar', length: 120, default: '' })
  subject!: string;

  // The report it came from
  @Column({ name: 'document_id', type: 'uuid', nullable: true })
  documentId!: string | null;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt!: Date | null;

  @ManyToOne(() => TerminalClientEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id', referencedColumnName: 'id', foreignKeyConstraintName: 'FK_terminal_signal_client' })
  client!: Relation<TerminalClientEntity>;

  @ManyToOne(() => DocumentEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'document_id', referencedColumnName: 'id', foreignKeyConstraintName: 'FK_terminal_signal_document' })
  document!: Relation<DocumentEntity> | null;
}
