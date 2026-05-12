import { getRandomInt } from '@sandworm/nest-common';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { ChatEntity, UserEntity, WorkspaceEntity, DocumentEntity } from '../entities';

export class ChatSeeder1760696707794 implements Seeder {
  track = false;

  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const userRepository = dataSource.getRepository(UserEntity);
    const workspaceRepository = dataSource.getRepository(WorkspaceEntity);
    const documentRepository = dataSource.getRepository(DocumentEntity);

    // Get random users
    const numberOfUsers = await userRepository.count();
    if (numberOfUsers === 0) {
      console.warn('No users found, skipping ChatSeeder');
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
      console.warn('No workspaces found, skipping ChatSeeder');
      return;
    }

    const randomWorkspaceOffset = getRandomInt(0, Math.max(0, numberOfWorkspaces - 1));
    const workspaces = await workspaceRepository
      .createQueryBuilder('workspace')
      .skip(randomWorkspaceOffset)
      .take(10)
      .getMany();

    // Get random documents
    const numberOfDocuments = await documentRepository.count();
    if (numberOfDocuments === 0) {
      console.warn('No documents found, skipping ChatSeeder');
      return;
    }

    const randomDocOffset = getRandomInt(0, Math.max(0, numberOfDocuments - 1));
    const documents = await documentRepository
      .createQueryBuilder('document')
      .skip(randomDocOffset)
      .take(10)
      .getMany();

    const chatFactory = factoryManager.get(ChatEntity);
    for (const user of users) {
      const randomWorkspace = workspaces[getRandomInt(0, workspaces.length - 1)];
      const randomDocument = documents[getRandomInt(0, documents.length - 1)];

      await chatFactory.saveMany(5, {
        userId: user.id,
        workspaceId: randomWorkspace.id,
        documentId: randomDocument.id,
      });
    }
  }
}