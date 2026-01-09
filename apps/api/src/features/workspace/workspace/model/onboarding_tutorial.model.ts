// apps/api/src/modules/workspace/model/onboarding_tutorial.model.ts
import { registerEnumType, ObjectType } from '@nestjs/graphql';
import { Field } from '@nestjs/graphql';
import { BooleanField, UUIDField } from '@sandworm/graphql';
import { OnboardingTutorialStep, TutorialEntity } from '@sandworm/postgresql-typeorm';

registerEnumType(OnboardingTutorialStep, {
  name: 'OnboardingTutorialStep',
  description: 'Steps of the onboarding tutorial',
});

@ObjectType()
export class OnboardingTutorial {
  @UUIDField()
  id!: string;

  @Field(() => OnboardingTutorialStep)
  currentStep!: OnboardingTutorialStep;

  @BooleanField()
  isComplete!: boolean;

  @BooleanField()
  isDismissed!: boolean;

  static fromEntity(entity: TutorialEntity): OnboardingTutorial {
    const tutorial = new OnboardingTutorial();
    tutorial.id = entity.id;
    tutorial.currentStep = entity.currentStep;
    tutorial.isComplete = entity.isComplete;
    tutorial.isDismissed = entity.isDismissed;
    return tutorial;
  }

  static fromEntities(entities: TutorialEntity[]): OnboardingTutorial[] {
    return entities.map((entity) => OnboardingTutorial.fromEntity(entity));
  }
}