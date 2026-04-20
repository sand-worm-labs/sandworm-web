import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DocumentEntity, UserEntity, WorkspaceEntity } from '../entities';

export class DocumentSeeder17320198482745 implements Seeder {
    track = false;

    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager,
    ): Promise<any> {
        const userRepository = dataSource.getRepository(UserEntity);
        const workspaceRepository = dataSource.getRepository(WorkspaceEntity);

        const users = await userRepository.find();
        const workspaces = await workspaceRepository.find();

        if (!users.length || !workspaces.length) {
            console.log('No users or workspaces found — skipping document seed');
            return;
        }

        const documentFactory = factoryManager.get(DocumentEntity);

        for (const user of users) {
            for (const workspace of workspaces) {
                await documentFactory.saveMany(5, {
                    authorId: user.id,
                    workspaceId: workspace.id,
                });
            }
        }

        console.log(
            `Seeded ${users.length * workspaces.length * 5} documents`,
        );
    }
}