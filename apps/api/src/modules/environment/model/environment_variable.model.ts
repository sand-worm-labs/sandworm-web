import { Field, ID, ObjectType } from '@nestjs/graphql';


@ObjectType()
export class EnvironmentVariable {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  value: string; 

  @Field(() => ID)
  workspaceId: string;

  @Field()
  updatedAt: Date;
}
