import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsUUID, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UUIDField, StringField } from '@sandworm/graphql';

@InputType()
export class EnvironmentVariableInput {
  @StringField()
  @IsString()
  name: string;

  @StringField()
  @IsString()
  value: string;
}

@InputType()
export class SetEnvironmentVariablesInput {
  @Field(() => [EnvironmentVariableInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EnvironmentVariableInput)
  add: EnvironmentVariableInput[];

  @Field(() => [String])
  @IsArray()
  @IsUUID('4', { each: true })
  remove: string[];
}

@InputType()
export class RestartEnvironmentInput {
  @UUIDField()
  @IsUUID()
  workspaceId: string;
}