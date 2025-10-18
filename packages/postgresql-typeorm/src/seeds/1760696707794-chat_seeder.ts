import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { ChatEntity, UserEntity } from '../entities';
import { getRandomInt } from '@sandworm/nest-common';

export class ChatSeeder1760696707794 implements Seeder {
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


        const chatFactory = factoryManager.get(ChatEntity);
        for (const user of users) {
            await chatFactory.saveMany(10, {
                userId: user.id,
            });
        }
    }
}
