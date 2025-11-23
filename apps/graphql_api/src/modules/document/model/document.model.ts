import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Document {
  @Field(() => ID)
  id!: string;

  @Field()
  slug!: string;

  @Field()
  title!: string;

  @Field(() => ID)
  authorId!: string;

  @Field(() => ID)
  workspaceId!: string;

  @Field(() => ID)
  parentId!: string;

  @Field(() => Boolean)
  runUnexecutedBlocks!: boolean;

  @Field(() => Boolean)
  runSQLSelection!: boolean;

  @Field(() => Boolean)
  shareLinksWithoutSidebar!: boolean;
}
