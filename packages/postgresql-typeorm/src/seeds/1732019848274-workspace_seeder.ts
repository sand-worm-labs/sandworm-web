// workspace.seeder.ts
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import {
  UserEntity,
  WorkspaceEntity,
  UserWorkspaceEntity,
  UserWorkspaceRole,
  UserWorkspaceStatus,
} from '../entities';

export class WorkspaceSeeder1732019848274 implements Seeder {
  track = false;

  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const userRepository = dataSource.getRepository(UserEntity);
    const workspaceRepository = dataSource.getRepository(WorkspaceEntity);
    const userWorkspaceRepository = dataSource.getRepository(UserWorkspaceEntity);

    const users = await userRepository.find();
    if (users.length === 0) {
      console.warn('No users found, skipping WorkspaceSeeder');
      return;
    }

    // Every user gets a workspace — a random skip/take(10) here used to
    // always leave exactly one user (sometimes 'admin') without one.
    const existingOwners = new Set(
      (await workspaceRepository.find()).map((w) => w.ownerId),
    );

    const workspaceFactory = factoryManager.get(WorkspaceEntity);
    for (const user of users) {
      if (existingOwners.has(user.id)) continue;

      const workspace = await workspaceFactory.save({
        ownerId: user.id,
        name: user.getTeamName(),
      });

      const userWorkspace = userWorkspaceRepository.create({
        userId: user.id,
        workspaceId: workspace.id,
        role: UserWorkspaceRole.ADMIN,
        status: UserWorkspaceStatus.ACTIVE,
        inviterId: null,
      });

      await userWorkspaceRepository.save(userWorkspace);
    }
  }
}