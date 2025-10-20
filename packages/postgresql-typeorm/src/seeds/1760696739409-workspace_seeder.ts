import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { getRandomInt } from '@sandworm/nest-common';
import { UserEntity, WorkspaceEntity } from '../entities';

export class WorkspaceSeeder1760696739409 implements Seeder {
    track = false;

    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
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

        const workspaceFactory = factoryManager.get(WorkspaceEntity);
        for (const user of users) {
            await workspaceFactory.saveMany(10, {
                ownerId: user.id,
            });
        }

    }
}
