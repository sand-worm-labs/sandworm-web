import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum EnvironmentStatus {
  RUNNING = 'Running',
  STOPPED = 'Stopped',
  STOPPING = 'Stopping',
  STARTING = 'Starting',
}

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
