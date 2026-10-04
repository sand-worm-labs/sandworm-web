import { Field, Int, ObjectType } from '@nestjs/graphql';
import { BooleanField, StringField, StringFieldOptional } from '@sandworm/graphql';
import { BountyEntity } from '@sandworm/postgresql-typeorm';

@ObjectType()
export class BountyWinner {
  @StringField()
  place!: string;

  @StringField()
  author!: string;

  @StringField()
  notebookSlug!: string;
}

// sourceUrl stays in the database only: it is for checking the brief against
// the original, not for the site.
@ObjectType()
export class Bounty {
  @StringField()
  slug!: string;

  @StringField()
  title!: string;

  @StringField()
  sponsor!: string;

  @StringField()
  type!: string;

  @StringFieldOptional()
  reward?: string | null;

  @StringField()
  status!: string;

  @StringField()
  summary!: string;

  @StringFieldOptional()
  background?: string | null;

  @Field(() => [String])
  requirements!: string[];

  @Field(() => [String])
  deliverables!: string[];

  @Field(() => [String])
  prizes!: string[];

  @Field(() => [String])
  judging!: string[];

  @Field(() => [String])
  dataHints!: string[];

  @Field(() => [BountyWinner])
  winners!: BountyWinner[];

  @StringFieldOptional()
  postedOn?: string | null;

  @BooleanField()
  sample!: boolean;

  @BooleanField()
  featured!: boolean;

  @Field(() => Int)
  position!: number;

  static fromEntity(entity: BountyEntity): Bounty {
    const bounty = new Bounty();
    bounty.slug = entity.slug;
    bounty.title = entity.title;
    bounty.sponsor = entity.sponsor;
    bounty.type = entity.type;
    bounty.reward = entity.reward;
    bounty.status = entity.status;
    bounty.summary = entity.summary;
    bounty.background = entity.background;
    bounty.requirements = entity.requirements;
    bounty.deliverables = entity.deliverables;
    bounty.prizes = entity.prizes;
    bounty.judging = entity.judging;
    bounty.dataHints = entity.dataHints;
    bounty.winners = entity.winners;
    bounty.postedOn = entity.postedOn;
    bounty.sample = entity.sample;
    bounty.featured = entity.featured;
    bounty.position = entity.position;
    return bounty;
  }

  static fromEntities(entities: BountyEntity[]): Bounty[] {
    return entities.map((entity) => Bounty.fromEntity(entity));
  }
}
