import { getRandomInt } from '@sandworm/nest-common';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DocumentEntity, UserEntity, WorkspaceEntity } from '../entities';

export class DocumentSeeder1760696714055 implements Seeder {
    track = false;

    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ): Promise<any> {

        const userRepository = dataSource.getRepository(UserEntity);
        const numberOfUsers = await userRepository.count();
        const randomOffset = getRandomInt(0, numberOfUsers - 1);

        const users = await userRepository
            .createQueryBuilder('user')
            .skip(randomOffset)
            .take(10)
            .getMany();


        const workspaceRepository = dataSource.getRepository(WorkspaceEntity);
        const numberOfWorksapce = await workspaceRepository.count();
        const randomWorkspaceOffset = getRandomInt(0, numberOfWorksapce - 1);

        const workspaces = await userRepository
            .createQueryBuilder('workspace')
            .skip(randomWorkspaceOffset)
            .take(10)
            .getMany();


        // const documentFactory = factoryManager.get(DocumentEntity);
        // for (const user of users) {
        //     await documentFactory.saveMany(10, {
        //         authorId: user.id,
        //         favoritedById: [user.id],
        //     });
        // }
    }
}
