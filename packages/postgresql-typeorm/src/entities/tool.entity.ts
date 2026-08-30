import { Column, Entity, Index, PrimaryColumn } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

@Entity('tool')
export class ToolEntity extends AbstractEntity {
  constructor(data?: Partial<ToolEntity>) {
    super();
    Object.assign(this, data);
  }

  // The dotted human id (e.g. "nft.collection_volume") is the primary key
  // rather than a surrogate UUID — this exact string is already the
  // pervasive external reference (frontend registry key, block.toolId
  // attribute, AI embedding payload tool_id), so a separate synthetic PK
  // would just be an unused extra column.
  @PrimaryColumn('varchar', { name: 'tool_id', primaryKeyConstraintName: 'PK_tool_tool_id' })
  toolId!: string;

  @Index('IDX_tool_category_id')
  @Column({ name: 'category_id' })
  categoryId!: string;

  @Column()
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'text', array: true, default: '{}' })
  tags!: string[];

  @Column({ type: 'jsonb', default: '[]' })
  params!: unknown[];

  // The CSV-sourced catalog's own category hierarchy, distinct from
  // categoryId (the frontend's flat 10-category taxonomy). Null for rows
  // that only ever existed in the curated frontend definitions.
  @Column({ name: 'g1', nullable: true })
  g1?: string;

  @Column({ name: 'g2', nullable: true })
  g2?: string;

  @Column({ name: 'g3', nullable: true })
  g3?: string;

  @Column({ name: 'g4', nullable: true })
  g4?: string;

  @Column({ name: 'g5', nullable: true })
  g5?: string;

  @Column({ nullable: true, default: 'generic' })
  scope?: string;

  @Column({ type: 'jsonb', default: '[]' })
  returns!: unknown[];
}
