import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

// A request made from a Showcase page: coverage for a protocol, a report, or a
// protocol's team claiming the case study about them. This table is the sales
// pipeline's inbox.
@Entity('showcase_lead')
export class ShowcaseLeadEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_showcase_lead_id' })
  id!: string;

  // 'coverage', 'report' or 'claim'.
  @Index('IDX_showcase_lead_kind')
  @Column()
  kind!: string;

  @Column({ type: 'text', nullable: true })
  category!: string | null;

  // A protocol name or a contract address, as the visitor typed it.
  @Column({ type: 'text' })
  protocol!: string;

  @Column({ type: 'text', nullable: true })
  email!: string | null;

  @Column({ type: 'text', nullable: true })
  company!: string | null;

  // Claims only: the case study being claimed, and the claimant's role at
  // the protocol.
  @Column({ name: 'notebook_slug', type: 'text', nullable: true })
  notebookSlug!: string | null;

  @Column({ type: 'text', nullable: true })
  role!: string | null;

  // Where the visitor came from: the UTM values on the page they were on.
  @Column({ type: 'jsonb', nullable: true })
  source!: Record<string, string> | null;

  // Set when the visitor was signed in.
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId!: string | null;
}
