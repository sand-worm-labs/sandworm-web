import { Field, ObjectType, ID } from '@nestjs/graphql';
import { Workspace } from './workspace.model';
import { User } from '@/api/user/model/user.model';
import { OnboardingTutorialStep } from '@sandworm/postgresql-typeorm';

@ObjectType()
export class OnboardingTutorial {
  @Field(() => ID)
  id!: string;

  @Field(() => OnboardingTutorialStep)
  currentStep!: OnboardingTutorialStep;

  @Field(() => Boolean)
  isComplete!: boolean;

  @Field(() => Boolean)
  isDismissed!: boolean;
}
