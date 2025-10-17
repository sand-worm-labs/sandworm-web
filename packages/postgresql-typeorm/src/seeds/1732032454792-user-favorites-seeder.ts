import { getRandomInt } from '@sandworm/nest-common';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DocumentEntity, UserEntity } from '../entities';

export class UserFavoritesSeeder1732032454792 implements Seeder {
  track = false;

  public async run(
    dataSource: DataSource,
    _factoryManager: SeederFactoryManager,
  ): Promise<any> {
    // Get random users
    const userRepository = dataSource.getRepository(UserEntity);
    const numberOfUsers = await userRepository.count();
    const randomOffset = getRandomInt(0, numberOfUsers - 1);

    const users = await userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.favorites', 'favorites')
      .skip(randomOffset)
      .take(10)
      .getMany();

    // Get random documents
    const documentRepository = dataSource.getRepository(DocumentEntity);
    const numberOfDocuments = await documentRepository.count();
    const randomDocumentOffset = getRandomInt(0, numberOfDocuments - 1);

    const documents = await documentRepository
      .createQueryBuilder('document')
      .skip(randomDocumentOffset)
      .take(10)
      .getMany();

    for (const user of users) {
      const randomDocumentNumber = getRandomInt(0, documents.length - 1);
      const isExist = user.favorites.some(
        (favorite) => favorite.id === documents[randomDocumentNumber].id,
      );

      if (!isExist) {
        user.favorites.push(documents[randomDocumentNumber]);
        await userRepository.save(user);
      }
    }
  }
}
