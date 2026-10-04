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

  @Column({ type: 'text' })
  summary!: string;

  // Prize tiers and selection criteria, one per line
  @Column({ type: 'jsonb', default: '[]' })
  judging!: string[];

  @Column({ type: 'jsonb', default: '[]' })
  winners!: BountyWinner[];

  // Where the original bounty was posted, for the ones taken from elsewhere
  @Column({ name: 'source_url', type: 'varchar', nullable: true })
  sourceUrl!: string | null;

  // A past bounty from another organisation's programme, not a live Sandworm bounty
  @Column({ default: false })
  sample!: boolean;

  // Shown on the landing site's home page
  @Column({ default: false })
  featured!: boolean;

  // Order on the bounties pages, lowest first
  @Column({ type: 'int', default: 0 })
  position!: number;
}
