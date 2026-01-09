import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  BooleanField,
  DateFieldOptional,
  NumberFieldOptional,
  StringFieldOptional,
  UUIDField,
} from '@sandworm/graphql';
import { ExecutionScheduleEntity, ExecutionScheduleType } from '@sandworm/postgresql-typeorm';

registerEnumType(ExecutionScheduleType, {
  name: 'ExecutionScheduleType',
  description: 'The type of execution schedule',
});

@ObjectType()
export class Schedule {
  @UUIDField()
  id!: string;

  @Field(() => ExecutionScheduleType)
  type!: ExecutionScheduleType;

  @NumberFieldOptional()
  hour?: number;

  @NumberFieldOptional()
  minute?: number;

  @StringFieldOptional()
  cron?: string;

  @StringFieldOptional()
  weekdays?: string;

  @StringFieldOptional()
  days?: string;

  @StringFieldOptional()
  timezone!: string;

  @BooleanField()
  isActive!: boolean;

  @DateFieldOptional()
  lastExecutedAt?: Date;

  @DateFieldOptional()
  nextExecutionAt?: Date;

  @UUIDField()
  documentId!: string;

  static fromEntity(entity: ExecutionScheduleEntity): Schedule {
    const schedule = new Schedule();
    schedule.id = entity.id;
    schedule.type = entity.type as ExecutionScheduleType;
    schedule.hour = entity.hour;
    schedule.minute = entity.minute;
    schedule.cron = entity.cron;
    schedule.weekdays = entity.weekdays;
    schedule.days = entity.days;
    schedule.timezone = entity.timezone;
    schedule.isActive = entity.isActive;
    schedule.lastExecutedAt = entity.lastExecutedAt;
    schedule.nextExecutionAt = entity.nextExecutionAt;
    schedule.documentId = entity.documentId;
    return schedule;
  }

  static fromEntities(entities: ExecutionScheduleEntity[]): Schedule[] {
    return entities.map((entity) => Schedule.fromEntity(entity));
  }
}