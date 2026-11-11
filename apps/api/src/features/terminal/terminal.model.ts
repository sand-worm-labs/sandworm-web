import { Field, Float, InputType, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { BooleanField, StringField } from '@sandworm/graphql';
import {
  AccessLevelId,
  GoalId,
  InviteTimingId,
  MAX_GOALS,
  OrganisationTypeId,
  PlanId,
  type ClientStatusId,
  type SetupDraft,
  type SubjectIcon,
  type TeamClientDetail,
  type TeamClientDraft,
  type TeamClientSource,
  type TeamClientSummary,
  type TeamSourceRun,
  type TerminalSession as TerminalSessionShape,
} from '@sandworm/types/terminal';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsEmail,
  IsEnum,
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
  @IsEnum(OrganisationTypeId)
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
  @IsEnum(GoalId, { each: true })
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
  @IsEnum(AccessLevelId)
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

  @Field(() => GraphQLJSON, { nullable: true })
  icon!: SubjectIcon | null;
}

@ObjectType('TerminalSession')
export class TerminalSession implements TerminalSessionShape {
  @Field(() => TerminalSessionUser)
  user!: TerminalSessionUser;

  @Field(() => TerminalSessionClient, { nullable: true })
  client!: TerminalSessionClient | null;

  @Field(() => Int)
  firstBriefingDays!: number;

  @Field()
  needsWelcome!: boolean;
}

// ── The Sandworm team's side ──

@ObjectType('TerminalTeamDetails')
@InputType('TerminalTeamDetailsInput')
export class TerminalTeamDetails {
  @StringField({ maxLength: 120 })
  name!: string;

  @StringField({ minLength: 0, maxLength: 255 })
  website!: string;

  @StringField()
  @IsEnum(OrganisationTypeId)
  type!: OrganisationTypeId;

  @StringField({ minLength: 0, maxLength: 500 })
  description!: string;

  @StringField()
  @IsEnum(PlanId)
  plan!: PlanId;

  @StringField({ minLength: 0, maxLength: 120 })
  adminName!: string;

  @StringField({ maxLength: 254 })
  @IsEmail()
  adminEmail!: string;
}

@ObjectType('TerminalTeamClientDraft')
@InputType('TerminalTeamClientDraftInput')
export class TerminalTeamClientDraft implements TeamClientDraft {
  @Field(() => TerminalTeamDetails)
  @ValidateNested()
  @Type(() => TerminalTeamDetails)
  details!: TerminalTeamDetails;

  @Field(() => TerminalTracking)
  @ValidateNested()
  @Type(() => TerminalTracking)
  tracking!: TerminalTracking;

  @Field(() => [String])
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  @ArrayMaxSize(MAX_LIST)
  starterIds!: string[];

  @StringField()
  @IsEnum(InviteTimingId)
  inviteTiming!: InviteTimingId;
}

// A client as the team's list shows it. Output only, so no validation.
@ObjectType('TerminalTeamClient')
export class TerminalTeamClient implements TeamClientSummary {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field(() => String)
  type!: OrganisationTypeId;

  @Field(() => String)
  plan!: PlanId;

  @Field(() => String)
  status!: ClientStatusId;

  @Field(() => String, { nullable: true })
  adminEmail!: string | null;

  @Field()
  createdAt!: string;
}

@ObjectType('TerminalSourceSchedule')
export class TerminalSourceSchedule {
  @Field()
  isActive!: boolean;

  @Field(() => String, { nullable: true })
  nextRunAt!: string | null;

  @Field(() => String, { nullable: true })
  lastRunAt!: string | null;
}

// A notebook that feeds a client's terminal. Output only.
@ObjectType('TerminalClientSource')
export class TerminalClientSource implements TeamClientSource {
  @Field()
  documentId!: string;

  @Field()
  title!: string;

  @Field()
  path!: string;

  @Field(() => Int)
  cells!: number;

  @Field(() => Int)
  items!: number;

  @Field(() => String, { nullable: true })
  lastRanAt!: string | null;

  @Field(() => TerminalSourceSchedule, { nullable: true })
  schedule!: TerminalSourceSchedule | null;
}

// One client as the team's client page shows it. Output only.
@ObjectType('TerminalClientDetail')
export class TerminalClientDetail extends TerminalTeamClient implements TeamClientDetail {
  @Field()
  website!: string;

  @Field()
  description!: string;

  @Field(() => Int)
  members!: number;

  @Field(() => String, { nullable: true })
  lastReadAt!: string | null;

  @Field(() => Int)
  openRequests!: number;

  @Field(() => Int)
  newSignals!: number;

  @Field(() => Int)
  researchAllowance!: number;

  @Field(() => [TerminalClientSource])
  sources!: TerminalClientSource[];
}

@ObjectType('TerminalSourceRunFailure')
export class TerminalSourceRunFailure {
  @Field()
  title!: string;

  @Field()
  message!: string;
}

// What running a source for a client did. Output only.
@ObjectType('TerminalSourceRun')
export class TerminalSourceRun implements TeamSourceRun {
  @Field(() => String)
  status!: 'idle' | 'running';

  @Field(() => Int)
  cells!: number;

  @Field(() => [TerminalSourceRunFailure])
  failed!: TerminalSourceRunFailure[];
}

// ── Key numbers (KPIs) ──

@ObjectType('TerminalKpiDelta')
export class TerminalKpiDelta {
  @Field()
  text!: string;

  @Field(() => String)
  tone!: 'positive' | 'negative' | 'neutral';
}

// A KPI as the terminal draws it: the value and change are worked out from its readings.
@ObjectType('TerminalKpi')
export class TerminalKpi {
  @Field()
  id!: string;

  @Field()
  label!: string;

  @Field()
  value!: string;

  @Field(() => TerminalKpiDelta, { nullable: true })
  delta?: TerminalKpiDelta;

  @Field(() => String, { nullable: true })
  comparison?: string;
}

// The numbers on a client's Overview, with what decides how the Overview opens.
@ObjectType('TerminalOverviewKpis')
export class TerminalOverviewKpis {
  @Field(() => String)
  clientType!: OrganisationTypeId;

  @Field(() => String)
  clientStatus!: ClientStatusId;

  // The client changed what it tracks and its numbers are being recalculated
  @Field(() => Boolean)
  isUpdating!: boolean;

  @Field(() => [TerminalKpi])
  kpis!: TerminalKpi[];
}

// A KPI as the team edits it: its definition and how it currently reads.
@ObjectType('TerminalKpiDefinition')
export class TerminalKpiDefinition {
  @Field()
  id!: string;

  @Field(() => String, { nullable: true })
  subjectId!: string | null;

  @Field()
  key!: string;

  @Field()
  label!: string;

  @Field()
  description!: string;

  @Field(() => Int)
  position!: number;

  @Field()
  isVisible!: boolean;

  @Field(() => GraphQLJSON)
  format!: Record<string, unknown>;

  @Field()
  direction!: string;

  @Field(() => GraphQLJSON)
  comparison!: Record<string, unknown>;

  @Field(() => GraphQLJSON)
  source!: Record<string, unknown>;

  @Field(() => GraphQLJSON)
  settings!: Record<string, unknown>;

  @Field(() => TerminalKpi)
  display!: TerminalKpi;

  @Field(() => String, { nullable: true })
  lastReadingAt!: string | null;
}

// Every field but the key may be left out: a new KPI starts from the defaults,
// and an existing one keeps what is not sent. The JSON fields are checked
// against the KPI schemas (@sandworm/types/terminal).
@InputType('TerminalKpiInput')
export class TerminalKpiInput {
  @Field(() => String, { nullable: true })
  subjectId?: string | null;

  @Field()
  key!: string;

  @Field(() => String, { nullable: true })
  label?: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Int, { nullable: true })
  position?: number;

  @Field({ nullable: true })
  isVisible?: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  format?: Record<string, unknown>;

  @Field(() => String, { nullable: true })
  direction?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  comparison?: Record<string, unknown>;

  @Field(() => GraphQLJSON, { nullable: true })
  source?: Record<string, unknown>;

  @Field(() => GraphQLJSON, { nullable: true })
  settings?: Record<string, unknown>;
}

// One reading. `asOf` defaults to today, so entering it again replaces it.
@InputType('TerminalKpiValueInput')
export class TerminalKpiValueInput {
  @Field(() => String, { nullable: true })
  asOf?: string;

  @Field(() => Float, { nullable: true })
  value?: number;

  @Field(() => String, { nullable: true })
  textValue?: string;

  @Field(() => Float, { nullable: true })
  previous?: number;
}
