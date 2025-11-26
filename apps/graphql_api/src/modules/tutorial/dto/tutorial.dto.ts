import { InputType } from '@nestjs/graphql';
import {
  UUIDField,
  StringField,
} from '@sandworm/graphql';


@InputType()
export class GetTutorialStateInput {
  @UUIDField()
  workspaceId: string;

  @StringField()
  tutorialType: 'onboarding';
}

@InputType()
export class AdvanceTutorialInput {
  @UUIDField()
  workspaceId: string;

  @StringField()
  tutorialType: 'onboarding';
}

@InputType()
export class DismissTutorialInput {
  @UUIDField()
  workspaceId: string;

  @StringField()
  tutorialType: 'onboarding';
}
