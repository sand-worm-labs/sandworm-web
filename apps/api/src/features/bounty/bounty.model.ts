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

  @Field(() => [String])
  judging!: string[];

  @Field(() => [BountyWinner])
  winners!: BountyWinner[];

  @StringFieldOptional()
  sourceUrl?: string | null;

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
    bounty.judging = entity.judging;
    bounty.winners = entity.winners;
    bounty.sourceUrl = entity.sourceUrl;
    bounty.sample = entity.sample;
    bounty.featured = entity.featured;
    bounty.position = entity.position;
    return bounty;
  }

  static fromEntities(entities: BountyEntity[]): Bounty[] {
    return entities.map((entity) => Bounty.fromEntity(entity));
  }
}
