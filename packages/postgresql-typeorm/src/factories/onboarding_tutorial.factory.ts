import { setSeederFactory } from 'typeorm-extension';
import { OnboardingStep, OnboardingTutorialEntity } from '../entities';

export default setSeederFactory(OnboardingTutorialEntity, (fake) => {
    const onboarding = new OnboardingTutorialEntity();

    const steps = Object.values(OnboardingStep);
    const randomStep = fake.helpers.arrayElement(steps);

    onboarding.currentStep = randomStep// adjust as needed
    onboarding.isComplete = fake.datatype.boolean();
    onboarding.isDismissed = fake.datatype.boolean();

    return onboarding;
});