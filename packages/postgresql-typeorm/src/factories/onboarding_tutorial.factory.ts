import { setSeederFactory } from 'typeorm-extension';
import { OnboardingTutorialStep, OnboardingTutorialEntity } from '../entities';
import { fake } from '../utils';

export default setSeederFactory(OnboardingTutorialEntity, () => {
    const onboarding = new OnboardingTutorialEntity();

    const steps = Object.values(OnboardingTutorialStep);
    const randomStep = fake.helpers.arrayElement(steps);

    onboarding.currentStep = randomStep// adjust as needed
    onboarding.isComplete = fake.datatype.boolean();
    onboarding.isDismissed = fake.datatype.boolean();

    return onboarding;
});