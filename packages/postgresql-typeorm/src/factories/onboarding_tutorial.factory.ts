import { setSeederFactory } from 'typeorm-extension';
import { OnboardingTutorialStep, TutorialEntity } from '../entities';
import { fake } from '../utils';

export default setSeederFactory(TutorialEntity, () => {
  const onboarding = new TutorialEntity();

  const steps = Object.values(OnboardingTutorialStep);
  const randomStep = fake.helpers.arrayElement(steps);

  onboarding.currentStep = randomStep; // adjust as needed
  onboarding.isComplete = fake.datatype.boolean();
  onboarding.isDismissed = fake.datatype.boolean();

  return onboarding;
});
