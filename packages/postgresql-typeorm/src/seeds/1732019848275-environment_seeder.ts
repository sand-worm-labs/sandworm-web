import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { WorkspaceEntity, EnvironmentEntity, EnvironmentStatus } from '../entities';

export class EnvironmentSeeder1732019848275 implements Seeder {
  track = false;

  public async run(
    dataSource: DataSource,
    _factoryManager: SeederFactoryManager
  ): Promise<any> {
    const workspaceRepository = dataSource.getRepository(WorkspaceEntity);
    const environmentRepository = dataSource.getRepository(EnvironmentEntity);

    const workspaces = await workspaceRepository.find();
    const existingWorkspaceIds = new Set(
      (await environmentRepository.find()).map((e) => e.workspaceId),
    );

    for (const workspace of workspaces) {
      if (existingWorkspaceIds.has(workspace.id)) continue;

      const environment = environmentRepository.create({
        workspaceId: workspace.id,
        status: EnvironmentStatus.STOPPED,
        resourceVersion: 0,
      });

      await environmentRepository.save(environment);
    }
  }
}