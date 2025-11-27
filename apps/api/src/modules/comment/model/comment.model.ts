import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Comment {
  @Field(() => ID)
  id: string;

  @Field()
  body: string;

  @Field(() => ID)
  documentId: string;

  @Field(() => ID)
  authorId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}