import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { DocumentEntity } from './document.entity';

// A notebook's inputs, committed onchain and re-checked by a validator (ERC-8004 on
// Monad). It says what was run and when, not what the output was: see packages/trust.
@Entity('notebook_attestation')
@Index('UQ_notebook_attestation_request_hash', ['requestHash'], { unique: true })
@Index('IDX_notebook_attestation_document', ['documentId'])
export class NotebookAttestationEntity extends AbstractEntity {
  constructor(data?: Partial<NotebookAttestationEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_notebook_attestation_id' })
  id!: string;

  @Column({ name: 'document_id', type: 'uuid' })
  documentId!: string;

  @Column({ name: 'workspace_id', type: 'uuid' })
  workspaceId!: string;

  // The ERC-8004 agent that published the receipt
  @Column({ name: 'agent_id', type: 'varchar' })
  agentId!: string;

  // keccak256 of the receipt bytes: the key the validation registry knows it by
  @Column({ name: 'request_hash', type: 'varchar', length: 66 })
  requestHash!: string;

  @Column({ name: 'receipt_uri', type: 'text' })
  receiptUri!: string;

  // Of the cells' code and parameters alone
  @Column({ name: 'code_hash', type: 'varchar', length: 66 })
  codeHash!: string;

  // Of the code and the time it ran
  @Column({ name: 'input_hash', type: 'varchar', length: 66 })
  inputHash!: string;

  @Column({ name: 'ran_at', type: 'timestamptz' })
  ranAt!: Date;

  @Column({ type: 'varchar', length: 42 })
  validator!: string;

  // 100 when every check passed, 0 when one did not; null until the validator has answered
  @Column({ type: 'smallint', nullable: true })
  response!: number | null;

  @Column({ name: 'request_tx', type: 'varchar', length: 66 })
  requestTx!: string;

  @Column({ name: 'response_tx', type: 'varchar', length: 66, nullable: true })
  responseTx!: string | null;

  @ManyToOne(() => DocumentEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'document_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_notebook_attestation_document',
  })
  document!: Relation<DocumentEntity>;
}
