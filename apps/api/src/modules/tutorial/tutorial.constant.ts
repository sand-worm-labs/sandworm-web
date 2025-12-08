// tutorial.constant.ts
import { OnboardingTutorialStep } from '@sandworm/postgresql-typeorm';

export const ONBOARDING_STEP_ORDER: OnboardingTutorialStep[] = [
  OnboardingTutorialStep.CONNECT_DATA_SOURCE,
  OnboardingTutorialStep.RUN_QUERY,
  OnboardingTutorialStep.RUN_PYTHON,
  OnboardingTutorialStep.CREATE_VISUALIZATION,
  OnboardingTutorialStep.PUBLISH_DASHBOARD,
  OnboardingTutorialStep.INVITE_TEAM_MEMBERS,
];