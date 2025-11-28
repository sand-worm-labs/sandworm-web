// apps/graphql_api/src/modules/schedule/model/schedule.model.ts
import { Field, ID, ObjectType, registerEnumType, Int } from '@nestjs/graphql';

export enum ExecutionScheduleType {
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CRON = 'cron',
}

registerEnumType(ExecutionScheduleType, {
  name: 'ExecutionScheduleType',
  description: 'The type of execution schedule',
});

@ObjectType()
export class Schedule {
  @Field(() => ID)
  id: string;

  @Field(() => ExecutionScheduleType)
  type: ExecutionScheduleType;

  @Field(() => Int, { nullable: true })
  hour?: number;

  @Field(() => Int, { nullable: true })
  minute?: number;

  @Field({ nullable: true })
  cron?: string;

  @Field({ nullable: true })
  weekdays?: string; // Serialized array of integers

  @Field({ nullable: true })
  days?: string; // Serialized array of integers

  @Field()
  timezone: string;

  @Field(() => Boolean)
  isActive: boolean;

  @Field({ nullable: true })
  lastExecutedAt?: Date;

  @Field({ nullable: true })
  nextExecutionAt?: Date;

  @Field(() => ID)
  documentId: string;
}