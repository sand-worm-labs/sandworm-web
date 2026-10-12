import { Column, Entity, Index, PrimaryColumn } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

// What the Showcase is made of: its groups, the categories in each, the chains
// it knows, and the fixed skeleton of each published template. Rows here are
// content, edited like content: adding a category is an insert, not a deploy.

@Entity('showcase_group')
export class ShowcaseGroupEntity extends AbstractEntity {
  @PrimaryColumn({ type: 'text', primaryKeyConstraintName: 'PK_showcase_group_id' })
  id!: string;

  @Column({ type: 'text' })
  label!: string;

  // Where it sits among the groups.
  @Column({ type: 'int', default: 0 })
  position!: number;
}

@Entity('showcase_category')
export class ShowcaseCategoryEntity extends AbstractEntity {
  @PrimaryColumn({ type: 'text', primaryKeyConstraintName: 'PK_showcase_category_slug' })
  slug!: string;

  @Index('IDX_showcase_category_group')
  @Column({ name: 'group_id', type: 'text' })
  groupId!: string;

  @Column({ type: 'text' })
  name!: string;

  // The one question the category's page answers.
  @Column({ type: 'text' })
  question!: string;

  @Column({ name: 'metric_spec', type: 'text', nullable: true })
  metricSpec!: string | null;

  // What the category is planned to cover, before any notebook says so.
  @Column({ type: 'text', array: true, default: () => "'{}'" })
  protocols!: string[];

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  chains!: string[];

  // Where it sits among all categories.
  @Column({ type: 'int', default: 0 })
  position!: number;
}

@Entity('showcase_chain')
export class ShowcaseChainEntity extends AbstractEntity {
  @PrimaryColumn({ type: 'text', primaryKeyConstraintName: 'PK_showcase_chain_name' })
  name!: string;

  @Column({ type: 'text' })
  color!: string;

  // Its place among the chain filters. Chains without one come after, by name.
  @Column({ type: 'int', nullable: true })
  position!: number | null;
}

@Entity('showcase_template')
export class ShowcaseTemplateEntity extends AbstractEntity {
  // 'case_study' or 'category'.
  @PrimaryColumn({ type: 'text', primaryKeyConstraintName: 'PK_showcase_template_kind' })
  kind!: string;

  // The template's sections, in order (ShowcaseTemplateSection in the web app).
  @Column({ type: 'jsonb' })
  sections!: Record<string, unknown>[];
}

// A protocol's logo, kept apart from the taxonomy so reading the config never loads image
// bytes. Served at /api/showcase/logos/:slug. A protocol with no row falls back to
// DefiLlama's icon for the same slug, then to its initial.
@Entity('showcase_protocol_logo')
export class ShowcaseProtocolLogoEntity extends AbstractEntity {
  // The protocol's slug, as the Showcase links to it (/showcase/lending/aave -> aave).
  @PrimaryColumn({ type: 'text', primaryKeyConstraintName: 'PK_showcase_protocol_logo_slug' })
  slug!: string;

  @Column({ type: 'text' })
  name!: string;

  // image/png, image/jpeg or image/webp.
  @Column({ name: 'content_type', type: 'text' })
  contentType!: string;

  @Column({ type: 'bytea' })
  data!: Buffer;

  // A hash of the bytes: the response's ETag, so a replaced logo is picked up.
  @Column({ type: 'text' })
  etag!: string;
}
