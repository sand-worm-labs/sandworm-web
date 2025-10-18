import { getRandomInt } from '@sandworm/nest-common';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DocumentEntity, CommentEntity, UserEntity } from '../entities';

export class CommentSeeder1732031567099 implements Seeder {
  track = false;

  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    // Get random users
    const userRepository = dataSource.getRepository(UserEntity);
    const numberOfUsers = await userRepository.count();
    const randomOffset = getRandomInt(0, numberOfUsers - 1);

    const users = await userRepository
      .createQueryBuilder('user')
      .skip(randomOffset)
      .take(10)
      .getMany();

    // Get random Documents
    const documentsRepository = dataSource.getRepository(DocumentEntity);
    const numberOfDocuments = await documentsRepository.count();
    const randomDocumentsOffset = getRandomInt(0, numberOfDocuments - 1);

    const documents = await documentsRepository
      .createQueryBuilder('document')
      .skip(randomDocumentsOffset)
      .take(10)
      .getMany();

    const commentFactory = factoryManager.get(CommentEntity);
    for (const user of users) {
      const randomDocumentsNumber = getRandomInt(0, documents.length - 1);
      await commentFactory.saveMany(5, {
        authorId: user.id,
        documentId: documents[randomDocumentsNumber].id,
      });
    }
  }
}
