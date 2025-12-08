// model/tutorial.model.ts
import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';
import { BooleanField, UUIDField } from '@sandworm/graphql';
import { OnboardingTutorialStep } from '@sandworm/postgresql-typeorm';
import { GraphQLJSON } from 'graphql-type-json';

registerEnumType(OnboardingTutorialStep, {
  name: 'OnboardingTutorialStep',
  description: 'Steps in the onboarding tutorial',
});

export enum StepState {
  COMPLETED = 'completed',
  CURRENT = 'current',
  UPCOMING = 'upcoming',
}

@ObjectType()
export class StepStates {
  @Field(() => StepState)
  connectDataSource: StepState;

  @Field(() => StepState)
  runQuery: StepState;

  @Field(() => StepState)
  runPython: StepState;

  @Field(() => StepState)
  createVisualization: StepState;

  @Field(() => StepState)
  publishDashboard: StepState;

  @Field(() => StepState)
  inviteTeamMembers: StepState;
}

@ObjectType()
export class TutorialStepState {
  @BooleanField()
  isCompleted: boolean;

  @BooleanField()
  isActive: boolean;
}

@ObjectType()
export class TutorialState {
  @UUIDField()
  id: string;

  @Field(() => OnboardingTutorialStep)
  currentStep: OnboardingTutorialStep;

  @BooleanField()
  isCompleted: boolean;

  @BooleanField()
  isDismissed: boolean;

  @Field(() => GraphQLJSON, { nullable: true }) 
  stepStates: Record<string, TutorialStepState>;
}

@ObjectType()
export class AdvanceTutorialResult {
  @Field(() => OnboardingTutorialStep, { nullable: true })
  prevStep: OnboardingTutorialStep | null;

  @Field(() => TutorialState, { nullable: true })
  currentState: TutorialState | null;

  @BooleanField()
  didAdvance: boolean;
}