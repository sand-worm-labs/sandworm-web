import { InputType } from '@nestjs/graphql';
import { IsString, IsUUID, IsBoolean, IsOptional } from 'class-validator';
import { UUIDField, StringField, BooleanFieldOptional } from '@sandworm/graphql';

@InputType()
export class CreateScheduleInput {
  @UUIDField()
  @IsUUID()
  documentId: string;

  @StringField()
  @IsString()
  cron: string;

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
  @StringField({ nullable: true })
  @IsString()
  @IsOptional()
  cron?: string;

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