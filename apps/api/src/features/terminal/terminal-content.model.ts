import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import {
  REQUEST_KIND_IDS,
  REQUEST_TIMING_IDS,
  REQUEST_USE_CASE_IDS,
  type AnalysisReport,
  type AnalysisSubject,
  type AnalysisViewKind,
  type BriefingItemData,
  type BriefingKindId,
  type EvidenceId,
  type RequestData,
  type RequestInput,
  type RequestKindId,
  type RequestScope,
  type RequestStatusId,
  type RequestTimingId,
  type RequestUseCaseId,
  type SignalData,
  type SignalStatusId,
  type TerminalAnalysis as TerminalAnalysisShape,
  type TerminalBriefing as TerminalBriefingShape,
  type TerminalCounts as TerminalCountsShape,
  type TerminalRequests as TerminalRequestsShape,
  type TerminalSignals as TerminalSignalsShape,
} from '@sandworm/types/terminal';
import {
  ArrayMaxSize,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';

// What the terminal shows a client. Shapes come from @sandworm/types/terminal.
// Everything here is output only, apart from the inputs at the bottom.

@ObjectType('TerminalAnalysisReport')
export class TerminalAnalysisReport implements AnalysisReport {
  @Field() id!: string;
  @Field() title!: string;
  @Field() line!: string;
  @Field() publishedAt!: string;
  @Field() isNew!: boolean;
  @Field() path!: string;
}

@ObjectType('TerminalAnalysisSubject')
export class TerminalAnalysisSubject implements AnalysisSubject {
  @Field() id!: string;
  @Field(() => String) view!: AnalysisViewKind;
  @Field() slug!: string;
  @Field() name!: string;
  @Field() kind!: string;
  @Field() impact!: string;
  @Field(() => Int) impactSize!: number;
  @Field(() => [TerminalAnalysisReport]) reports!: TerminalAnalysisReport[];
}

@ObjectType('TerminalAnalysis')
export class TerminalAnalysis implements TerminalAnalysisShape {
  @Field(() => [TerminalAnalysisSubject]) subjects!: TerminalAnalysisSubject[];
}

@ObjectType('TerminalBriefingItem')
export class TerminalBriefingItem implements BriefingItemData {
  @Field() id!: string;
  @Field(() => String) kind!: BriefingKindId;
  @Field() title!: string;
  @Field() summary!: string;
  @Field() subject!: string;
  @Field(() => GraphQLJSON) detail!: Record<string, unknown>;
  @Field() publishedAt!: string;
  @Field() isRead!: boolean;
  @Field(() => String, { nullable: true }) sourcePath!: string | null;
}

@ObjectType('TerminalBriefing')
export class TerminalBriefing implements TerminalBriefingShape {
  @Field(() => String, { nullable: true }) lastSeenAt!: string | null;
  @Field(() => [TerminalBriefingItem]) items!: TerminalBriefingItem[];
  @Field(() => Int) archivedCount!: number;
}

@ObjectType('TerminalSignal')
export class TerminalSignal implements SignalData {
  @Field() id!: string;
  @Field(() => String) status!: SignalStatusId;
  @Field() title!: string;
  @Field() observed!: string;
  @Field() couldMean!: string;
  @Field() kind!: string;
  @Field() size!: string;
  @Field() sizeLabel!: string;
  @Field(() => String) evidence!: EvidenceId;
  @Field() subject!: string;
  @Field() publishedAt!: string;
  @Field(() => String, { nullable: true }) reportPath!: string | null;
}

@ObjectType('TerminalSignals')
export class TerminalSignals implements TerminalSignalsShape {
  @Field(() => [TerminalSignal]) items!: TerminalSignal[];
}

@ObjectType('TerminalRequest')
export class TerminalRequest implements RequestData {
  @Field() id!: string;
  @Field(() => String) kind!: RequestKindId;
  @Field() question!: string;
  @Field(() => String) status!: RequestStatusId;
  @Field(() => String, { nullable: true }) useCase!: RequestUseCaseId | null;
  @Field(() => [String]) about!: string[];
  @Field(() => String, { nullable: true }) timing!: RequestTimingId | null;
  @Field(() => String, { nullable: true }) requestedBy!: string | null;
  @Field(() => GraphQLJSON, { nullable: true }) scope!: RequestScope | null;
  @Field(() => String, { nullable: true }) progressNote!: string | null;
  @Field(() => String, { nullable: true }) outcome!: string | null;
  @Field(() => String, { nullable: true }) reportPath!: string | null;
  @Field() submittedAt!: string;
  @Field(() => String, { nullable: true }) scopedAt!: string | null;
  @Field(() => String, { nullable: true }) approvedAt!: string | null;
  @Field(() => String, { nullable: true }) closedAt!: string | null;
}

@ObjectType('TerminalAllowance')
export class TerminalAllowance {
  @Field(() => Int) used!: number;
  @Field(() => Int) total!: number;
  @Field() resetsAt!: string;
}

@ObjectType('TerminalRequests')
export class TerminalRequests implements TerminalRequestsShape {
  @Field(() => TerminalAllowance) allowance!: TerminalAllowance;
  @Field(() => [TerminalRequest]) requests!: TerminalRequest[];
}

@ObjectType('TerminalCounts')
export class TerminalCounts implements TerminalCountsShape {
  @Field(() => Int) briefing!: number;
  @Field(() => Int) analysis!: number;
  @Field(() => Int) signals!: number;
  @Field(() => Int) requests!: number;
}

const MAX_LIST = 20;

@InputType('TerminalRequestInput')
export class TerminalRequestInput implements RequestInput {
  @Field(() => String)
  @IsIn(REQUEST_KIND_IDS)
  kind!: RequestKindId;

  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  question!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsIn(REQUEST_USE_CASE_IDS)
  useCase!: RequestUseCaseId | null;

  @Field(() => [String])
  @IsString({ each: true })
  @MaxLength(120, { each: true })
  @ArrayMaxSize(MAX_LIST)
  about!: string[];

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsIn(REQUEST_TIMING_IDS)
  timing!: RequestTimingId | null;

  @Field(() => [String])
  @IsString({ each: true })
  @MaxLength(255, { each: true })
  @ArrayMaxSize(MAX_LIST)
  files!: string[];
}
