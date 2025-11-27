import {  ObjectType, Field, registerEnumType } from '@nestjs/graphql';
import { BooleanField} from '@sandworm/graphql';
import { OnboardingTutorialStep } from '@sandworm/postgresql-typeorm';

registerEnumType(OnboardingTutorialStep, {
  name: 'OnboardingTutorialStep',
  description: 'Steps in the onboarding tutorial',
})

@ObjectType()
export class TutorialStepState {
  @BooleanField()
  isComplete: boolean;

  @BooleanField()
  isActive: boolean;
}

@ObjectType()
export class TutorialState {
  @Field(() => OnboardingTutorialStep)
  currentStep: OnboardingTutorialStep;

  @BooleanField()
  isComplete: boolean;

  @BooleanField()
  isDismissed: boolean;

  @Field(() => Object, { nullable: true })
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