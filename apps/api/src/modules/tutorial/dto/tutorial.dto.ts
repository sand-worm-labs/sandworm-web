// dto/tutorial.dto.ts
import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { OnboardingTutorialStep } from '@sandworm/postgresql-typeorm';

@InputType()
export class GetTutorialStateInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  workspaceId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  tutorialType: string;
}

@InputType()
export class AdvanceTutorialInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  workspaceId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  tutorialType: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  ifCurrentStep?: OnboardingTutorialStep;
}

@InputType()
export class DismissTutorialInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  workspaceId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  tutorialType: string;
}