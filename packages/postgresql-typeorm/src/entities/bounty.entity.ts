import { Column, Entity, PrimaryColumn } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

export type BountyWinner = {
  place: string;
  author: string;
  // Slug of the published notebook, as in /notebooks/<slug>
  notebookSlug: string;
};

@Entity('bounty')
export class BountyEntity extends AbstractEntity {
  constructor(data?: Partial<BountyEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryColumn('varchar', { primaryKeyConstraintName: 'PK_bounty_slug' })
  slug!: string;

  @Column()
  title!: string;

  @Column()
  sponsor!: string;

  // Dashboard, Research or Investigation
  @Column()
  type!: string;

  // Null when the sponsor has not set a reward
  @Column({ type: 'varchar', nullable: true })
  reward!: string | null;

  // open, judging or closed
  @Column({ default: 'open' })
  status!: string;

  // One or two sentences, for the cards
  @Column({ type: 'text' })
  summary!: string;

  // Why the sponsor wants it, for the detail page
  @Column({ type: 'text', nullable: true })
  background!: string | null;

  // The questions the work must answer, one per line
  @Column({ type: 'jsonb', default: '[]' })
  requirements!: string[];

  // What an entry must hand in, one per line
  @Column({ type: 'jsonb', default: '[]' })
  deliverables!: string[];

  // Prize tiers, one per line
  @Column({ type: 'jsonb', default: '[]' })
  prizes!: string[];

  // Selection criteria, one per line
  @Column({ type: 'jsonb', default: '[]' })
  judging!: string[];

  // Where in Sandworm the data can be found, one per line
  @Column({ name: 'data_hints', type: 'jsonb', default: '[]' })
  dataHints!: string[];

  @Column({ type: 'jsonb', default: '[]' })
  winners!: BountyWinner[];

  // When the sponsor first posted it, as free text ("May 2024")
  @Column({ name: 'posted_on', type: 'varchar', nullable: true })
  postedOn!: string | null;

  // Where the original bounty was posted, for the ones taken from elsewhere.
  // Kept to check the brief against; not shown on the site.
  @Column({ name: 'source_url', type: 'varchar', nullable: true })
  sourceUrl!: string | null;

  // A bounty from another organisation's programme, listed as an example;
  // Sandworm does not pay its reward
  @Column({ default: false })
  sample!: boolean;

  // Shown on the landing site's home page
  @Column({ default: false })
  featured!: boolean;

  // Order on the bounties pages, lowest first
  @Column({ type: 'int', default: 0 })
  position!: number;
}
