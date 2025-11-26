import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { EnvironmentStatus } from '@sandworm/postgresql-typeorm';

registerEnumType(EnvironmentStatus, {
  name: 'EnvironmentStatus',
  description: 'The status of the Jupyter environment',
});

@ObjectType()
export class Environment {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  workspaceId: string;

  @Field(() => EnvironmentStatus)
  status: EnvironmentStatus;

  @Field()
  resourceVersion: number;

  @Field(()=> Date)
  lastActivityAt: Date
}
