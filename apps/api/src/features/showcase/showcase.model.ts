import { Field, Int, ObjectType } from '@nestjs/graphql';
import { DateField, StringField, StringFieldOptional, UUIDField } from '@sandworm/graphql';
import { DocumentEntity } from '@sandworm/postgresql-typeorm';
import type { NotebookShowcase, ShowcaseAuthor } from '@sandworm/types';
import { GraphQLJSON } from 'graphql-type-json';

// A notebook as the Showcase pages need it: enough to build a card and a
// link, plus its Showcase metadata. The notebook itself is loaded by slug.
@ObjectType('ShowcaseNotebook')
export class ShowcaseNotebookModel {
  @UUIDField()
  id!: string;

  @StringField()
  slug!: string;

  @StringField()
  title!: string;

  @StringFieldOptional()
  description!: string | null;

  @DateField()
  publishedAt!: Date;

  @StringField({ description: 'official or community' })
  author!: ShowcaseAuthor;

  @Field(() => GraphQLJSON)
  showcase!: NotebookShowcase;

  @Field(() => Boolean, { description: 'The notebook has a dashboard its author left public' })
  hasDashboard!: boolean;

  static fromEntity(entity: DocumentEntity, author: ShowcaseAuthor, hasDashboard = false): ShowcaseNotebookModel {
    const notebook = new ShowcaseNotebookModel();
    notebook.id = entity.id;
    notebook.slug = entity.slug!;
    notebook.title = entity.title;
    notebook.description = entity.description;
    notebook.publishedAt = entity.publishedAt!;
    notebook.author = author;
    notebook.showcase = entity.showcase as unknown as NotebookShowcase;
    notebook.hasDashboard = hasDashboard;
    return notebook;
  }
}

// A notebook the community published about a Showcase category. It is not on the Showcase
// itself: it is found by what it is about (its tags, title or description).
@ObjectType('ShowcaseCommunityItem')
export class ShowcaseCommunityModel {
  @UUIDField()
  id!: string;

  @StringField()
  slug!: string;

  @StringField()
  title!: string;

  @StringFieldOptional()
  description!: string | null;

  @DateField()
  publishedAt!: Date;

  @Field(() => [String])
  tags!: string[];

  @Field(() => Boolean, { description: 'It also has a public dashboard, at /notebooks/:slug/dashboard' })
  hasDashboard!: boolean;

  @Field(() => Int)
  forks!: number;

  @StringFieldOptional()
  authorName!: string | null;

  @StringFieldOptional()
  authorUsername!: string | null;
}
