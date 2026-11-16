import { AnalysisViewKind, type SubjectIcon } from '@sandworm/types/terminal';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { DocumentEntity } from './document.entity';
import { TerminalClientEntity } from './terminal-client.entity';

// One row of a client's Analysis catalog: a project, region or sector Sandworm
// has researched for them. A project points at a parent document; its reports
// are that document's children (document.parent_id). Regions and sectors have
// no document: a report of the client's shows under one when its tags hold the
// subject's id, so a report is never copied.
@Entity('terminal_analysis_subject')
export class TerminalAnalysisSubjectEntity extends AbstractEntity {
  constructor(data?: Partial<TerminalAnalysisSubjectEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_terminal_analysis_subject_id' })
  id!: string;

  @Column({ name: 'client_id', type: 'uuid' })
  clientId!: string;

  @Column({ type: 'varchar', length: 16 })
  view!: AnalysisViewKind;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  // A logo, a flag or a symbol; null shows the initial of the name
  @Column({ type: 'jsonb', nullable: true })
  icon!: SubjectIcon | null;

  // The short line under the name ("Payments · Africa")
  @Column({ type: 'varchar', length: 120, default: '' })
  kind!: string;

  // What it means for the client ("2,140 of your users") and what that sorts by
  @Column({ type: 'varchar', length: 120, default: '' })
  impact!: string;

  @Column({ name: 'impact_size', type: 'integer', default: 0 })
  impactSize!: number;

  // Projects only: the document whose children are the reports
  @Column({ name: 'document_id', type: 'uuid', nullable: true })
  documentId!: string | null;

  @ManyToOne(() => TerminalClientEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id', referencedColumnName: 'id', foreignKeyConstraintName: 'FK_terminal_analysis_subject_client' })
  client!: Relation<TerminalClientEntity>;

  @ManyToOne(() => DocumentEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'document_id', referencedColumnName: 'id', foreignKeyConstraintName: 'FK_terminal_analysis_subject_document' })
  document!: Relation<DocumentEntity> | null;
}
