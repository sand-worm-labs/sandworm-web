import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsUUID, IsBoolean, IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { UUIDField, StringField, BooleanFieldOptional, NumberFieldOptional } from '@sandworm/graphql';
import { ExecutionScheduleType } from '@sandworm/postgresql-typeorm';

@InputType()
export class CreateScheduleInput {
  @UUIDField()
  @IsUUID()
  documentId: string;

  @Field(() => ExecutionScheduleType)
  @IsEnum(ExecutionScheduleType)
  type: ExecutionScheduleType;

  @NumberFieldOptional()
  @IsInt()
  @Min(0)
  @Max(23)
  @IsOptional()
  hour?: number;

  @NumberFieldOptional()
  @IsInt()
  @Min(0)
  @Max(59)
  @IsOptional()
  minute?: number;

  @StringField({ nullable: true })
  @IsString()
  @IsOptional()
  cron?: string;

  @StringField({ nullable: true })
  @IsString()
  @IsOptional()
  weekdays?: string;

  @StringField({ nullable: true })
  @IsString()
  @IsOptional()
  days?: string;

  @StringField()
  @IsString()
  timezone: string;

  @BooleanFieldOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

@InputType()
export class UpdateScheduleInput {
  @Field(() => ExecutionScheduleType, { nullable: true })
  @IsEnum(ExecutionScheduleType)
  @IsOptional()
  type?: ExecutionScheduleType;

  @NumberFieldOptional()
  @IsInt()
  @Min(0)
  @Max(23)
  @IsOptional()
  hour?: number;

  @NumberFieldOptional()
  @IsInt()
  @Min(0)
  @Max(59)
  @IsOptional()
  minute?: number;

  @StringField({ nullable: true })
  @IsString()
  @IsOptional()
  cron?: string;

  @StringField({ nullable: true })
  @IsString()
  @IsOptional()
  weekdays?: string;

  @StringField({ nullable: true })
  @IsString()
  @IsOptional()
  days?: string;

  @StringField({ nullable: true })
  @IsString()
  @IsOptional()
  timezone?: string;

  @BooleanFieldOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

@InputType()
export class DeleteScheduleInput {
  @UUIDField()
  @IsUUID()
  workspaceId: string;

  @UUIDField()
  @IsUUID()
  documentId: string;

  @UUIDField()
  @IsUUID()
  scheduleId: string;
}

@InputType()
export class ListSchedulesInput {
  @UUIDField()
  @IsUUID()
  documentId: string;
}