import { registerEnumType,Field, ObjectType, ID } from '@nestjs/graphql';
import { OnboardingTutorialStep } from '@sandworm/postgresql-typeorm';

registerEnumType(OnboardingTutorialStep, {
    name: 'OnboardingTutorialStep',
    description: 'Steps of the onboarding tutorial',
});

@ObjectType()
export class OnboardingTutorial {
  @Field(() => ID)
  id!: string;

  @Field(() => OnboardingTutorialStep, { defaultValue : OnboardingTutorialStep.INVITE_TEAM_MEMBERS })
  currentStep!: OnboardingTutorialStep;

  @Field(() => Boolean)
  isComplete!: boolean;

  @Field(() => Boolean)
  isDismissed!: boolean;
}
