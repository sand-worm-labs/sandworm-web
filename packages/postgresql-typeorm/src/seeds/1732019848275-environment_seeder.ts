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

    for (const workspace of workspaces) {
      // skip if environment already exists for this workspace
      const existing = await environmentRepository.findOne({
        where: { workspaceId: workspace.id },
      });
      if (existing) continue;

      const environment = environmentRepository.create({
        workspaceId: workspace.id,
        status: EnvironmentStatus.STOPPED,
        resourceVersion: 0,
      });

      await environmentRepository.save(environment);
    }
  }
}