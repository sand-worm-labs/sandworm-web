import { Field, InputType } from '@nestjs/graphql';
import { ArrayMaxSize, IsDate, IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { StringField, StringFieldOptional, UUIDField } from '@sandworm/graphql';
import { escrowTokens } from '@sandworm/types/escrow';

export const BOUNTY_TYPES = ['Dashboard', 'Research', 'Investigation'] as const;
export const BOUNTY_TOKENS = [...new Set(Object.values(escrowTokens).flatMap(tokens => tokens.map(token => token.symbol)))];

@InputType()
export class CreateBountyInput {
  @UUIDField()
  workspaceId: string;

  @StringField({ maxLength: 120 })
  title: string;

  @StringField({ maxLength: 80 })
  sponsor: string;

  @StringField()
  @IsIn(BOUNTY_TYPES)
  type: string;

  @StringField({ maxLength: 400 })
  summary: string;

  @StringFieldOptional({ maxLength: 4000 })
  background?: string;

  @StringField({ maxLength: 20000 })
  details: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(400, { each: true })
  @ArrayMaxSize(20)
  requirements?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(400, { each: true })
  @ArrayMaxSize(20)
  deliverables?: string[];

  @StringField()
  @IsIn(BOUNTY_TOKENS)
  rewardToken: string;

  @StringField({ maxLength: 30 })
  @Matches(/^(?!0+(\.0+)?$)\d+(\.\d{1,6})?$/, { message: 'rewardAmount must be a positive amount with at most 6 decimals' })
  rewardAmount: string;

  @Field(() => Date)
  @IsDate()
  deadline: Date;
}
