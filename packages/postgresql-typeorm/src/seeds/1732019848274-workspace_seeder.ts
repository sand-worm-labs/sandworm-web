import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { getRandomInt } from '@sandworm/nest-common';
import { UserEntity, WorkspaceEntity, UserWorkspaceEntity, UserWorkspaceRole } from '../entities';

export class WorkspaceSeeder1732019848274 implements Seeder {
  track = false;

  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager
  ): Promise<any> {
    const userRepository = dataSource.getRepository(UserEntity);
    const userWorkspaceRepository = dataSource.getRepository(UserWorkspaceEntity);

    const numberOfUsers = await userRepository.count();
    const randomOffset = getRandomInt(0, numberOfUsers - 1);
    const users = await userRepository
      .createQueryBuilder('user')
      .skip(randomOffset)
      .take(10)
      .getMany();

    const workspaceFactory = factoryManager.get(WorkspaceEntity);

    for (const user of users) {
      // Create workspaces for this user
      const workspace = await workspaceFactory.save({
        ownerId: user.id,
        name: user.getTeamName()
      });

      // Create UserWorkspace entry with ADMIN role
      const userWorkspace = userWorkspaceRepository.create({
        userId: user.id,
        workspaceId: workspace.id,
        role: UserWorkspaceRole.ADMIN,
        inviterId: null,
      });

      await userWorkspaceRepository.save(userWorkspace);
    }
  }
}