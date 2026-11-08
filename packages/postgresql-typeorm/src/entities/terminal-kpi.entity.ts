import {
  DEFAULT_KPI_COMPARISON,
  DEFAULT_KPI_FORMAT,
  DEFAULT_KPI_SOURCE,
  KPI_DIRECTIONS,
  KpiComparison,
  KpiFormat,
  KpiSettings,
  KpiSource,
  type KpiDirection,
} from '@sandworm/types/terminal';
import { BeforeInsert, BeforeUpdate, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { TerminalAnalysisSubjectEntity } from './terminal-analysis-subject.entity';
import { TerminalClientEntity } from './terminal-client.entity';

export { KPI_DIRECTIONS };

// A key number on a terminal client's Overview, or on one of its project, region
// or sector pages when it has a subject. This is the definition: what it is
// called, how it is written, which way is good, what it is compared with and
// where its readings come from. The readings are terminal_kpi_value. What the
// terminal draws is worked out from both (buildKpi in @sandworm/types/terminal).
@Entity('terminal_kpi')
@Index('IDX_terminal_kpi_order', ['clientId', 'subjectId', 'position'])
@Index('UQ_terminal_kpi_overview_key', ['clientId', 'key'], { unique: true, where: '"subject_id" IS NULL' })
@Index('UQ_terminal_kpi_subject_key', ['clientId', 'subjectId', 'key'], { unique: true, where: '"subject_id" IS NOT NULL' })
export class TerminalKpiEntity extends AbstractEntity {
  constructor(data?: Partial<TerminalKpiEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_terminal_kpi_id' })
  id!: string;

  @Column({ name: 'client_id', type: 'uuid' })
  clientId!: string;

  // Null for a client-level Overview KPI
  @Column({ name: 'subject_id', type: 'uuid', nullable: true })
  subjectId!: string | null;

  // Stable, so a notebook or agent can name the KPI it writes to
  @Column({ type: 'varchar', length: 64 })
  key!: string;

  @Column({ type: 'varchar', length: 120 })
  label!: string;

  @Column({ type: 'varchar', length: 300, default: '' })
  description!: string;

  @Column({ type: 'integer', default: 0 })
  position!: number;

  @Column({ name: 'is_visible', type: 'boolean', default: true })
  isVisible!: boolean;

  @Column({ type: 'jsonb', default: () => `'${JSON.stringify(DEFAULT_KPI_FORMAT)}'` })
  format!: KpiFormat;

  @Column({ type: 'varchar', length: 12, default: 'neutral' })
  direction!: KpiDirection;

  @Column({ type: 'jsonb', default: () => `'${JSON.stringify(DEFAULT_KPI_COMPARISON)}'` })
  comparison!: KpiComparison;

  @Column({ type: 'jsonb', default: () => `'${JSON.stringify(DEFAULT_KPI_SOURCE)}'` })
  source!: KpiSource;

  // Whatever a KPI needs that has no column yet
  @Column({ type: 'jsonb', default: '{}' })
  settings!: KpiSettings;

  @ManyToOne(() => TerminalClientEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'client_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_terminal_kpi_client',
  })
  client!: Relation<TerminalClientEntity>;

  @ManyToOne(() => TerminalAnalysisSubjectEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({
    name: 'subject_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_terminal_kpi_subject',
  })
  subject!: Relation<TerminalAnalysisSubjectEntity> | null;

  // The JSON columns are open on purpose, so the shapes are checked here before
  // every write: a bad format or source fails the save, not a later read.
  @BeforeInsert()
  @BeforeUpdate()
  assertConfig(): void {
    if (this.format !== undefined) KpiFormat.parse(this.format);
    if (this.comparison !== undefined) KpiComparison.parse(this.comparison);
    if (this.source !== undefined) KpiSource.parse(this.source);
    if (this.settings !== undefined) KpiSettings.parse(this.settings);
    if (this.direction !== undefined && !KPI_DIRECTIONS.includes(this.direction)) {
      throw new Error(`Unknown KPI direction "${this.direction}"`);
    }
  }
}
