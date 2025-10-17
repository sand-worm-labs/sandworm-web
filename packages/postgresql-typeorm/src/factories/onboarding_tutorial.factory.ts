import { setSeederFactory } from 'typeorm-extension';
import { OnboardingTutorialEntity } from '../entities';

export default setSeederFactory(OnboardingTutorialEntity, (fake) => {
    const onboarding = new OnboardingTutorialEntity();

    // onboarding.title = fake.lorem.sentence();
    // onboarding.description = fake.lorem.sentences(2);
    // onboarding.stepNumber = fake.datatype.number({ min: 1, max: 10 });
    // onboarding.isActive = fake.datatype.boolean();
    // onboarding.createdAt = fake.date.past();
    // onboarding.updatedAt = fake.date.recent();

    return onboarding;
});