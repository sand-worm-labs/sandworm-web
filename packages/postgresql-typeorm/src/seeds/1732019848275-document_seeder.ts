import { getRandomInt } from '@sandworm/nest-common';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DocumentEntity, UserEntity, WorkspaceEntity } from '../entities';

export class DocumentSeeder17320198482745 implements Seeder {
  track = false;

  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const userRepository = dataSource.getRepository(UserEntity);
    const workspaceRepository = dataSource.getRepository(WorkspaceEntity);

    const numberOfUsers = await userRepository.count();
    if (numberOfUsers === 0) {
      console.warn('No users found, skipping DocumentSeeder');
      return;
    }

    const randomOffset = getRandomInt(0, Math.max(0, numberOfUsers - 1));
    const users = await userRepository
      .createQueryBuilder('user')
      .skip(randomOffset)
      .take(10)
      .getMany();

    // Get random workspaces
    const numberOfWorkspaces = await workspaceRepository.count();
    if (numberOfWorkspaces === 0) {
      console.warn('No workspaces found, skipping DocumentSeeder');
      return;
    }

    const randomWorkspaceOffset = getRandomInt(0, Math.max(0, numberOfWorkspaces - 1));
    const workspaces = await workspaceRepository
      .createQueryBuilder('workspace')
      .skip(randomWorkspaceOffset)
      .take(10)
      .getMany();

    const documentFactory = factoryManager.get(DocumentEntity);
    for (const user of users) {
      const randomWorkspace = workspaces[getRandomInt(0, workspaces.length - 1)];
      await documentFactory.saveMany(5, {
        authorId: user.id,
        workspaceId: randomWorkspace.id,
      });
    }
  }
}