import type { Output } from '@sandworm/types';
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { DocumentEntity } from './document.entity';
import { TerminalClientEntity } from './terminal-client.entity';
import { TerminalMemberEntity } from './terminal-member.entity';
import { UserEntity } from './user.entity';

export const TERMINAL_BRIEFING_KINDS = ['analysis', 'opportunity', 'metric'] as const;
export type TerminalBriefingKind = (typeof TERMINAL_BRIEFING_KINDS)[number];

// What the item's detail panel shows. `outputs` is a frozen copy of the cell's
// outputs from the run at ran_at (any chart, table or card the cell drew), so the
// briefing still reads well for someone who cannot open the notebook.
export type TerminalBriefingDetail = {
  headline?: { value: string; label: string; delta?: { text: string; tone: string } };
  outputs?: Output[];
  what?: string;
  why?: string;
};

// One item in a terminal client's briefing. Every item comes from a notebook
// cell, from Sandworm's agents or from the client's own workspace, and links
// back to it. Drafts (published_at null) are not shown to the client.
@Entity('terminal_briefing_item')
@Index('IDX_terminal_briefing_item_feed', ['clientId', 'publishedAt'])
@Index('IDX_terminal_briefing_item_member', ['memberId'])
@Index('UQ_terminal_briefing_item_source_run', ['documentId', 'blockId', 'ranAt'], { unique: true })
export class TerminalBriefingItemEntity extends AbstractEntity {
  constructor(data?: Partial<TerminalBriefingItemEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_terminal_briefing_item_id' })
  id!: string;

  @Column({ name: 'client_id', type: 'uuid' })
  clientId!: string;

  // Null: everyone at the client. Set: only this member (e.g. from their own notebook).
  @Column({ name: 'member_id', type: 'uuid', nullable: true })
  memberId!: string | null;

  @Column({ type: 'varchar', length: 16 })
  kind!: TerminalBriefingKind;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text', default: '' })
  summary!: string;

  // What the item is about: a region, protocol, product ("Argentina", "Paycrest")
  @Column({ type: 'varchar', length: 120, default: '' })
  subject!: string;

  @Column({ type: 'jsonb', default: '{}' })
  detail!: TerminalBriefingDetail;

  // The source cell. The notebook may be deleted later; the copy above stays.
  @Column({ name: 'document_id', type: 'uuid', nullable: true })
  documentId!: string | null;

  // A block id inside the notebook's Yjs document, so no foreign key
  @Column({ name: 'block_id', type: 'uuid' })
  blockId!: string;

  // The run of the cell this item was made from
  @Column({ name: 'ran_at', type: 'timestamptz' })
  ranAt!: Date;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt!: Date | null;

  // The user who made it; null when an agent made it, or once they are deleted
  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy!: string | null;

  @ManyToOne(() => TerminalClientEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id', referencedColumnName: 'id', foreignKeyConstraintName: 'FK_terminal_briefing_item_client' })
  client!: Relation<TerminalClientEntity>;

  @ManyToOne(() => TerminalMemberEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'member_id', referencedColumnName: 'id', foreignKeyConstraintName: 'FK_terminal_briefing_item_member' })
  member!: Relation<TerminalMemberEntity> | null;

  @ManyToOne(() => DocumentEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'document_id', referencedColumnName: 'id', foreignKeyConstraintName: 'FK_terminal_briefing_item_document' })
  document!: Relation<DocumentEntity> | null;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'created_by', referencedColumnName: 'id', foreignKeyConstraintName: 'FK_terminal_briefing_item_creator' })
  creator!: Relation<UserEntity> | null;
}
