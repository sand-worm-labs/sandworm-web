import { BaseEntity, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation } from 'typeorm';
import { DocumentEntity } from './document.entity';
import { TerminalKpiEntity } from './terminal-kpi.entity';
import { UserEntity } from './user.entity';

// numeric comes back from Postgres as text
const numeric = {
  to: (value: number | null | undefined) => value,
  from: (value: string | null) => (value === null ? null : Number(value)),
};

// One reading of a KPI. One per as_of: a rerun for the same period replaces it.
@Entity('terminal_kpi_value')
@Index('UQ_terminal_kpi_value_as_of', ['kpiId', 'asOf'], { unique: true })
export class TerminalKpiValueEntity extends BaseEntity {
  constructor(data?: Partial<TerminalKpiValueEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_terminal_kpi_value_id' })
  id!: string;

  @Column({ name: 'kpi_id', type: 'uuid' })
  kpiId!: string;

  // The moment or period the number describes
  @Column({ name: 'as_of', type: 'timestamptz' })
  asOf!: Date;

  @Column({ type: 'numeric', nullable: true, transformer: numeric })
  value!: number | null;

  // For a KPI that is words, not a number
  @Column({ name: 'text_value', type: 'varchar', length: 120, nullable: true })
  textValue!: string | null;

  // The source's own comparison figure, when it supplies one
  @Column({ type: 'numeric', nullable: true, transformer: numeric })
  previous!: number | null;

  @Column({ type: 'jsonb', default: '{}' })
  meta!: Record<string, unknown>;

  // Where the reading came from, as on briefing items
  @Column({ name: 'document_id', type: 'uuid', nullable: true })
  documentId!: string | null;

  @Column({ name: 'block_id', type: 'uuid', nullable: true })
  blockId!: string | null;

  @Column({ name: 'ran_at', type: 'timestamptz', nullable: true })
  ranAt!: Date | null;

  // Who typed it in, for a manual reading
  @Column({ name: 'recorded_by', type: 'uuid', nullable: true })
  recordedBy!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @ManyToOne(() => TerminalKpiEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'kpi_id', referencedColumnName: 'id', foreignKeyConstraintName: 'FK_terminal_kpi_value_kpi' })
  kpi!: Relation<TerminalKpiEntity>;

  @ManyToOne(() => DocumentEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'document_id', referencedColumnName: 'id', foreignKeyConstraintName: 'FK_terminal_kpi_value_document' })
  document!: Relation<DocumentEntity> | null;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'recorded_by', referencedColumnName: 'id', foreignKeyConstraintName: 'FK_terminal_kpi_value_user' })
  recorder!: Relation<UserEntity> | null;
}
