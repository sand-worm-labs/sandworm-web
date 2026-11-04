import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { BooleanField, StringField } from '@sandworm/graphql';
import {
  ACCESS_LEVEL_IDS,
  GOAL_IDS,
  MAX_GOALS,
  ORGANISATION_TYPE_IDS,
  type AccessLevelId,
  type GoalId,
  type OrganisationTypeId,
  type SetupDraft,
  type TerminalSession as TerminalSessionShape,
} from '@sandworm/types/terminal';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsIn,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

// Each class is both the setup the API returns and the input it takes, so the
// shape is written once. The shape itself is SetupDraft (@sandworm/types/terminal),
// the same type the terminal uses.

const MAX_LIST = 50;

@ObjectType('TerminalOrganisation')
@InputType('TerminalOrganisationInput')
export class TerminalOrganisation {
  @StringField()
  @IsIn(ORGANISATION_TYPE_IDS)
  type!: OrganisationTypeId;

  @StringField({ minLength: 0, maxLength: 120 })
  name!: string;

  @StringField({ minLength: 0, maxLength: 255 })
  website!: string;

  @StringField({ minLength: 0, maxLength: 500 })
  description!: string;
}

@ObjectType('TerminalTracking')
@InputType('TerminalTrackingInput')
export class TerminalTracking {
  @StringField({ minLength: 0, maxLength: 20000 })
  addresses!: string;

  @BooleanField()
  autoDiscover!: boolean;

  @Field(() => [String])
  @IsString({ each: true })
  @MaxLength(120, { each: true })
  @ArrayMaxSize(MAX_LIST)
  competitors!: string[];

  @Field(() => [String])
  @IsString({ each: true })
  @MaxLength(120, { each: true })
  @ArrayMaxSize(MAX_LIST)
  regions!: string[];

  @BooleanField()
  shareInternalData!: boolean;
}

@ObjectType('TerminalGoals')
@InputType('TerminalGoalsInput')
export class TerminalGoals {
  @Field(() => [String])
  @IsIn(GOAL_IDS, { each: true })
  @ArrayMaxSize(MAX_GOALS)
  selected!: GoalId[];
}

@ObjectType('TerminalInvite')
@InputType('TerminalInviteInput')
export class TerminalInvite {
  @StringField({ maxLength: 64 })
  id!: string;

  // Empty while the row is still being filled in
  @StringField({ minLength: 0, maxLength: 254 })
  email!: string;

  @StringField()
  @IsIn(ACCESS_LEVEL_IDS)
  access!: AccessLevelId;
}

@ObjectType('TerminalTeam')
@InputType('TerminalTeamInput')
export class TerminalTeam {
  @Field(() => [TerminalInvite])
  @ValidateNested({ each: true })
  @Type(() => TerminalInvite)
  @ArrayMaxSize(MAX_LIST)
  invites!: TerminalInvite[];
}

@ObjectType('TerminalSetup')
@InputType('TerminalSetupInput')
export class TerminalSetup implements SetupDraft {
  @Field(() => TerminalOrganisation)
  @ValidateNested()
  @Type(() => TerminalOrganisation)
  organisation!: TerminalOrganisation;

  @Field(() => TerminalTracking)
  @ValidateNested()
  @Type(() => TerminalTracking)
  tracking!: TerminalTracking;

  @Field(() => TerminalGoals)
  @ValidateNested()
  @Type(() => TerminalGoals)
  goals!: TerminalGoals;

  @Field(() => TerminalTeam)
  @ValidateNested()
  @Type(() => TerminalTeam)
  team!: TerminalTeam;
}

// The session is output only, so its classes carry no validation.

@ObjectType('TerminalSessionUser')
export class TerminalSessionUser {
  @Field()
  name!: string;
}

@ObjectType('TerminalSessionClient')
export class TerminalSessionClient {
  @Field()
  name!: string;

  @Field(() => String)
  type!: OrganisationTypeId;

  @Field(() => String)
  access!: AccessLevelId;
}

@ObjectType('TerminalSession')
export class TerminalSession implements TerminalSessionShape {
  @Field(() => TerminalSessionUser)
  user!: TerminalSessionUser;

  @Field(() => TerminalSessionClient, { nullable: true })
  client!: TerminalSessionClient | null;

  @Field(() => Int)
  firstBriefingDays!: number;
}
