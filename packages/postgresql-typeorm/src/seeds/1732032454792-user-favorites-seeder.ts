import { getRandomInt } from '@sandworm/nest-common';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DocumentEntity, UserEntity, FavoriteEntity } from '../entities';

export class UserFavoritesSeeder1732032454792 implements Seeder {
  track = false;

  public async run(
    dataSource: DataSource,
    _factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const userRepository = dataSource.getRepository(UserEntity);
    const documentRepository = dataSource.getRepository(DocumentEntity);
    const favoriteRepository = dataSource.getRepository(FavoriteEntity);

    const numberOfUsers = await userRepository.count();
    const randomOffset = getRandomInt(0, numberOfUsers - 1);

    const users = await userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.favorites', 'favorites')
      .skip(randomOffset)
      .take(10)
      .getMany();

    // --- GET RANDOM DOCUMENTS ---
    const numberOfDocuments = await documentRepository.count();
    const randomDocumentOffset = getRandomInt(0, numberOfDocuments - 1);

    const documents = await documentRepository
      .createQueryBuilder('document')
      .skip(randomDocumentOffset)
      .take(10)
      .getMany();

    for (const user of users) {
      const randomDocument = documents[getRandomInt(0, documents.length - 1)];

      const exists = await favoriteRepository.findOne({
        where: { user: { id: user.id }, document: { id: randomDocument.id } },
      });

      if (!exists) {
        const fav = favoriteRepository.create({
          user,
          document: randomDocument,
        });

        await favoriteRepository.save(fav);
      }
    }
  }
}
