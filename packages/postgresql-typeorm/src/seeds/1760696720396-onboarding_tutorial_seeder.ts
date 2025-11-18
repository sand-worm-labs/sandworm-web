import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { OnboardingTutorialEntity, UserEntity, WorkspaceEntity } from '../entities';
import { getRandomInt } from '@sandworm/nest-common';
import { OnboardingTutorialStep } from '../entities/enums';

export class OnboardingTutorialSeeder1760696720396 implements Seeder {
  track = false;

  public async run(
    dataSource: DataSource,
    _factoryManager: SeederFactoryManager
  ): Promise<any> {

    const userRepository = dataSource.getRepository(UserEntity);
    const workspaceRepository = dataSource.getRepository(WorkspaceEntity);
    const tutorialRepository = dataSource.getRepository(OnboardingTutorialEntity);

    // --- Fetch random users ---
    const numberOfUsers = await userRepository.count();
    const randomUserOffset = getRandomInt(0, numberOfUsers - 1);

    const users = await userRepository
      .createQueryBuilder('user')
      .skip(randomUserOffset)
      .take(10)
      .getMany();

    const numberOfWorkspaces = await workspaceRepository.count();
    const randomWsOffset = getRandomInt(0, numberOfWorkspaces - 1);

    const workspaces = await workspaceRepository
      .createQueryBuilder('workspace')
      .skip(randomWsOffset)
      .take(10)
      .getMany();

    for (const user of users) {
      const workspace =
        workspaces[getRandomInt(0, workspaces.length - 1)];

      const exists = await tutorialRepository.findOne({
        where: { userId: user.id, workspaceId: workspace.id },
      });

      if (!exists) {
        const tutorial = tutorialRepository.create({
          userId: user.id,
          workspaceId: workspace.id,
          currentStep: OnboardingTutorialStep.RUN_QUERY,
          isComplete: false,
          isDismissed: false,
        });

        await tutorialRepository.save(tutorial);
      }
    }
  }
}
